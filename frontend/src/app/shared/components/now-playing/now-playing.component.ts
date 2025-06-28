import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AudioService, AudioState } from "../../../core/services/audio.service";
import { MusicService } from "../../../core/services/music.service";
import { ThemeService } from "../../../core/services/theme.service";

@Component({
  selector: "app-now-playing",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      *ngIf="audioState.currentSong"
      class="theme-surface border-t border-gray-800 p-4 flex items-center justify-between"
      [class.border-gray-200]="!(themeService.isDarkMode$ | async)"
    >
      <!-- Song Info -->
      <div class="flex items-center space-x-4 flex-1">
        <div class="relative">
          <img
            [src]="getImageUrl(audioState.currentSong.imageUrl)"
            [alt]="audioState.currentSong.title"
            class="w-14 h-14 rounded"
          />
          <div *ngIf="audioState.isPlaying" class="absolute -top-1 -right-1">
            <div class="music-bars">
              <div class="music-bar"></div>
              <div class="music-bar"></div>
              <div class="music-bar"></div>
              <div class="music-bar"></div>
            </div>
          </div>
        </div>
        <div>
          <h4 class="theme-text font-medium">
            {{ audioState.currentSong.title }}
          </h4>
          <p class="theme-muted text-sm">{{ audioState.currentSong.artist }}</p>
        </div>
        <button
          (click)="toggleLike()"
          class="theme-muted hover:theme-text transition-colors"
          [class.text-red-500]="isLiked"
        >
          {{ isLiked ? "❤️" : "🤍" }}
        </button>
      </div>

      <!-- Player Controls -->
      <div class="flex flex-col items-center space-y-2 flex-2">
        <!-- Control Buttons -->
        <div class="flex items-center space-x-6">
          <button
            (click)="toggleShuffle()"
            [class.text-spotify-green]="audioState.shuffle"
            class="theme-muted hover:bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            title="Shuffle"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M4 4h2.586l8.707 8.707a1 1 0 01-1.414 1.414L5.172 5.414V8a1 1 0 11-2 0V4a1 1 0 011-1h4a1 1 0 110 2H5.414l8.293 8.293a3 3 0 004.243-4.243L8.414 3.586A1 1 0 017 2.172V4a1 1 0 11-2 0V2a1 1 0 011-1z"
              />
            </svg>
          </button>
          <button
            (click)="previous()"
            class="theme-muted hover:bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            title="Previous"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 17V7l-7 5 7 5zm-8-5a1 1 0 112 0 1 1 0 01-2 0z" />
            </svg>
          </button>
          <button
            (click)="togglePlay()"
            class="bg-spotify-green text-black rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:scale-105 transition-transform border-2 border-spotify-green"
            [disabled]="audioState.isLoading"
            title="{{ audioState.isPlaying ? 'Pause' : 'Play' }}"
          >
            <span *ngIf="audioState.isLoading" class="animate-spin">⟳</span>
            <span *ngIf="!audioState.isLoading">
              <svg
                *ngIf="audioState.isPlaying"
                width="28"
                height="28"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <rect x="6" y="4" width="3" height="12" rx="1" />
                <rect x="11" y="4" width="3" height="12" rx="1" />
              </svg>
              <svg
                *ngIf="!audioState.isPlaying"
                width="28"
                height="28"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <polygon points="5,3 19,10 5,17" />
              </svg>
            </span>
          </button>
          <button
            (click)="next()"
            class="theme-muted hover:bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            title="Next"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 17l7-5-7-5v10zm8-5a1 1 0 112 0 1 1 0 01-2 0z" />
            </svg>
          </button>
          <button
            (click)="toggleRepeat()"
            [class.text-spotify-green]="audioState.repeat !== 'none'"
            class="theme-muted hover:bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            title="Repeat: {{ audioState.repeat }}"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M4 4h12v2H4V4zm0 10h12v2H4v-2zm2-6h8v2H6V8zm0 4h8v2H6v-2z"
              />
            </svg>
          </button>
        </div>

        <!-- Progress Bar -->
        <div class="flex items-center space-x-2 w-full max-w-md">
          <span class="text-xs theme-muted min-w-[40px]">
            {{ formatTime(audioState.currentTime) }}
          </span>

          <div class="flex-1 relative">
            <input
              type="range"
              [min]="0"
              [max]="audioState.duration"
              [value]="audioState.currentTime"
              (input)="seek($event)"
              class="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              [class.light-mode]="!(themeService.isDarkMode$ | async)"
            />
          </div>

          <span class="text-xs theme-muted min-w-[40px]">
            {{ formatTime(audioState.duration) }}
          </span>
        </div>
        <audio
          *ngIf="audioState.currentSong"
          [src]="getAudioUrl(audioState.currentSong)"
          controls
          style="display:none"
        ></audio>
      </div>

      <!-- Volume Control -->
      <div class="flex items-center space-x-2 flex-1 justify-end">
        <button
          (click)="toggleMute()"
          class="theme-muted hover:theme-text transition-colors"
        >
          {{
            audioState.volume === 0
              ? "🔇"
              : audioState.volume < 0.5
              ? "🔉"
              : "🔊"
          }}
        </button>
        <input
          type="range"
          [min]="0"
          [max]="1"
          [step]="0.01"
          [value]="audioState.volume"
          (input)="setVolume($event)"
          class="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          [class.light-mode]="!(themeService.isDarkMode$ | async)"
        />
      </div>
    </div>
  `,
  styles: [
    `
      .slider {
        background: linear-gradient(
          to right,
          #1db954 0%,
          #1db954 var(--progress, 0%),
          #4a5568 var(--progress, 0%),
          #4a5568 100%
        );
      }

      .slider::-webkit-slider-thumb {
        appearance: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #1db954;
        cursor: pointer;
        border: none;
      }

      .slider::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #1db954;
        cursor: pointer;
        border: none;
      }
    `,
  ],
})
export class NowPlayingComponent implements OnInit {
  audioState!: AudioState;
  isLiked = false;
  previousVolume = 0.7;

  constructor(
    public audioService: AudioService,
    private musicService: MusicService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.audioService.audioState$.subscribe((state) => {
      this.audioState = state;
      this.checkIfLiked();
    });
  }

  private checkIfLiked(): void {
    if (this.audioState.currentSong) {
      // Public songs cannot be liked
      if (this.audioState.currentSong._id.startsWith("public-")) {
        this.isLiked = false;
        return;
      }

      this.musicService.getLikedSongs().subscribe({
        next: (likedSongs) => {
          this.isLiked = likedSongs.some(
            (song) => song._id === this.audioState.currentSong?._id
          );
        },
        error: (error) => console.error("Error checking liked status:", error),
      });
    }
  }

  togglePlay(): void {
    if (this.audioState.isPlaying) {
      this.audioService.pause();
    } else {
      this.audioService.play();
    }
  }

  previous(): void {
    this.audioService.previous();
  }

  next(): void {
    this.audioService.next();
  }

  seek(event: any): void {
    const time = parseFloat(event.target.value);
    this.audioService.seek(time);
  }

  setVolume(event: any): void {
    const volume = parseFloat(event.target.value);
    this.audioService.setVolume(volume);
    if (volume > 0) {
      this.previousVolume = volume;
    }
  }

  toggleMute(): void {
    if (this.audioState.volume === 0) {
      this.audioService.setVolume(this.previousVolume);
    } else {
      this.previousVolume = this.audioState.volume;
      this.audioService.setVolume(0);
    }
  }

  toggleShuffle(): void {
    this.audioService.toggleShuffle();
  }

  toggleRepeat(): void {
    this.audioService.toggleRepeat();
  }

  toggleLike(): void {
    if (this.audioState.currentSong) {
      // Check if it's a public song (can't be liked)
      if (this.audioState.currentSong._id.startsWith("public-")) {
        alert(
          "Public songs cannot be liked. Please connect to access the full library."
        );
        return;
      }

      if (this.isLiked) {
        this.musicService
          .unlikeSong(this.audioState.currentSong._id)
          .subscribe({
            next: () => {
              this.isLiked = false;
            },
            error: (error) => console.error("Error unliking song:", error),
          });
      } else {
        this.musicService.likeSong(this.audioState.currentSong._id).subscribe({
          next: () => {
            this.isLiked = true;
          },
          error: (error) => console.error("Error liking song:", error),
        });
      }
    }
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  getImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) return "/assets/default-album.png";
    if (imageUrl.startsWith("http")) return imageUrl;
    if (
      imageUrl.startsWith("/cover-images/") ||
      imageUrl.startsWith("/albums/")
    ) {
      // Public images from frontend/public/
      return imageUrl;
    }
    // Backend images
    return "http://localhost:3000" + imageUrl;
  }

  public getAudioUrl(song: any): string {
    return this.audioService.getAudioUrl(song);
  }
}
