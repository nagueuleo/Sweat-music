import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Howl } from "howler";
import { Song } from "../models/song.model";
import { MusicService } from "./music.service";

export interface AudioState {
  isPlaying: boolean;
  currentSong: Song | null;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  queue: Song[];
  currentIndex: number;
  shuffle: boolean;
  repeat: "none" | "one" | "all";
}

@Injectable({
  providedIn: "root",
})
export class AudioService {
  private howl: Howl | null = null;
  private updateInterval: any;

  private audioStateSubject = new BehaviorSubject<AudioState>({
    isPlaying: false,
    currentSong: null,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isLoading: false,
    queue: [],
    currentIndex: 0,
    shuffle: false,
    repeat: "none",
  });

  public audioState$ = this.audioStateSubject.asObservable();

  constructor(private musicService: MusicService) {
    this.loadVolumeFromStorage();
  }

  private loadVolumeFromStorage(): void {
    const savedVolume = localStorage.getItem("audioVolume");
    if (savedVolume) {
      const volume = parseFloat(savedVolume);
      this.updateState({ volume });
    }
  }

  private updateState(update: Partial<AudioState>): void {
    const currentState = this.audioStateSubject.value;
    this.audioStateSubject.next({ ...currentState, ...update });
  }

  loadSong(song: Song): void {
    // Store current playing state
    const wasPlaying = this.audioStateSubject.value.isPlaying;

    // Unload previous song if exists
    if (this.howl) {
      this.howl.unload();
    }

    this.updateState({ isLoading: true, currentSong: song });

    // Construct full URL for audio
    let audioUrl: string;

    if (song.audioUrl.startsWith("http")) {
      // External URL
      audioUrl = song.audioUrl;
    } else if (song.audioUrl.startsWith("/songs/")) {
      // Public songs from frontend/public/songs/
      audioUrl = song.audioUrl; // Already correct for public folder
    } else {
      // Backend songs
      audioUrl = `http://localhost:3000${song.audioUrl}`;
    }

    console.log("Loading audio URL:", audioUrl);

    this.howl = new Howl({
      src: [audioUrl],
      html5: true,
      volume: this.audioStateSubject.value.volume,
      onload: () => {
        console.log("Audio loaded successfully");
        this.updateState({
          isLoading: false,
          duration: this.howl?.duration() || 0,
        });

        // Auto-play if it was playing before or if it's a new song selection
        if (wasPlaying || this.audioStateSubject.value.isPlaying) {
          this.play();
        }
      },
      onplay: () => {
        console.log("Audio started playing");
        this.updateState({ isPlaying: true });
        this.startTimeUpdate();
        // Record play in backend only for non-public songs
        if (!song._id.startsWith("public-")) {
          this.recordPlay(song._id);
        }
      },
      onpause: () => {
        console.log("Audio paused");
        this.updateState({ isPlaying: false });
        this.stopTimeUpdate();
      },
      onend: () => {
        console.log("Audio ended");
        this.handleSongEnd();
      },
      onloaderror: (id: any, error: any) => {
        console.error("Audio load error:", error, "URL:", audioUrl);
        this.updateState({ isLoading: false });
      },
      onplayerror: (id: any, error: any) => {
        console.error("Audio play error:", error, "URL:", audioUrl);
        this.updateState({ isLoading: false });
      },
    });
  }

  play(): void {
    if (this.howl && !this.audioStateSubject.value.isPlaying) {
      this.howl.play();
    }
  }

  playSong(song: Song): void {
    // If it's the same song, just play/pause
    const currentState = this.audioStateSubject.value;
    if (currentState.currentSong?._id === song._id) {
      if (currentState.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
      return;
    }

    // If it's a different song, load and play it
    this.loadSong(song);
    // The play will be triggered in loadSong's onload callback
  }

  pause(): void {
    if (this.howl && this.audioStateSubject.value.isPlaying) {
      this.howl.pause();
    }
  }

  stop(): void {
    if (this.howl) {
      this.howl.stop();
      this.updateState({ isPlaying: false, currentTime: 0 });
      this.stopTimeUpdate();
    }
  }

  seek(time: number): void {
    if (this.howl) {
      this.howl.seek(time);
      this.updateState({ currentTime: time });
    }
  }

  setVolume(volume: number): void {
    if (this.howl) {
      this.howl.volume(volume);
      this.updateState({ volume });
      localStorage.setItem("audioVolume", volume.toString());
    }
  }

  setQueue(songs: Song[], startIndex = 0): void {
    // Store current playing state
    const wasPlaying = this.audioStateSubject.value.isPlaying;

    this.updateState({ queue: songs, currentIndex: startIndex });
    if (songs.length > 0) {
      this.loadSong(songs[startIndex]);

      // Auto-play the new song if it was playing before
      if (wasPlaying) {
        // The play will be triggered in loadSong's onload callback
        console.log("Auto-playing new song in queue");
      }
    }
  }

  next(): void {
    const state = this.audioStateSubject.value;
    let nextIndex = state.currentIndex + 1;

    if (state.shuffle) {
      nextIndex = Math.floor(Math.random() * state.queue.length);
    } else if (nextIndex >= state.queue.length) {
      if (state.repeat === "all") {
        nextIndex = 0;
      } else {
        return; // End of queue
      }
    }

    this.updateState({ currentIndex: nextIndex });
    this.loadSong(state.queue[nextIndex]);
    this.play();
  }

  previous(): void {
    const state = this.audioStateSubject.value;
    let prevIndex = state.currentIndex - 1;

    if (prevIndex < 0) {
      if (state.repeat === "all") {
        prevIndex = state.queue.length - 1;
      } else {
        return; // Beginning of queue
      }
    }

    this.updateState({ currentIndex: prevIndex });
    this.loadSong(state.queue[prevIndex]);
    this.play();
  }

  toggleShuffle(): void {
    const state = this.audioStateSubject.value;
    this.updateState({ shuffle: !state.shuffle });
  }

  toggleRepeat(): void {
    const state = this.audioStateSubject.value;
    const repeatModes: ("none" | "one" | "all")[] = ["none", "one", "all"];
    const currentIndex = repeatModes.indexOf(state.repeat);
    const nextRepeat = repeatModes[(currentIndex + 1) % repeatModes.length];
    this.updateState({ repeat: nextRepeat });
  }

  private handleSongEnd(): void {
    const state = this.audioStateSubject.value;

    if (state.repeat === "one") {
      this.seek(0);
      this.play();
    } else {
      this.next();
    }
  }

  private startTimeUpdate(): void {
    this.updateInterval = setInterval(() => {
      if (this.howl && this.audioStateSubject.value.isPlaying) {
        this.updateState({ currentTime: this.howl.seek() as number });
      }
    }, 1000);
  }

  private stopTimeUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  private recordPlay(songId: string): void {
    this.musicService.recordPlay(songId).subscribe({
      next: () => console.log("Play recorded"),
      error: (error) => console.error("Error recording play:", error),
    });
  }

  getCurrentState(): AudioState {
    return this.audioStateSubject.value;
  }
}
