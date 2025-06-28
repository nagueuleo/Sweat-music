import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Song } from "../../../core/models/song.model";
import { ThemeService } from "../../../core/services/theme.service";
import { AudioService } from "../../../core/services/audio.service";

@Component({
  selector: "app-song-list",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-2">
      <!-- Header -->
      <div
        class="flex items-center p-2 border-b border-gray-700 theme-muted text-sm"
        [class.border-gray-300]="!(themeService.isDarkMode$ | async)"
      >
        <div class="w-10 text-center">#</div>
        <div class="flex-1 ml-4">Title</div>
        <div class="hidden md:block w-1/4 px-4">Album</div>
        <div class="w-16 text-right">Duration</div>
        <div class="w-12"></div>
      </div>

      <!-- Songs -->
      <div
        *ngFor="let song of songs; let i = index"
        (click)="playSong(song, i)"
        class="flex items-center p-2 rounded hover:bg-gray-800 cursor-pointer group transition-colors"
        [class.hover:bg-gray-100]="!(themeService.isDarkMode$ | async)"
        [class.bg-gray-800]="isCurrentSong(song)"
        [class.bg-gray-100]="
          isCurrentSong(song) && !(themeService.isDarkMode$ | async)
        "
      >
        <!-- Play Button / Index -->
        <div class="w-10 text-center">
          <span
            class="theme-muted group-hover:hidden"
            [class.hidden]="isCurrentSong(song)"
            >{{ i + 1 }}</span
          >
          <button
            class="hidden group-hover:block theme-text"
            [class.block]="isCurrentSong(song)"
          >
            <span
              *ngIf="isCurrentSong(song) && isPlaying"
              class="text-spotify-green"
            >
              <div class="music-bars">
                <div class="music-bar"></div>
                <div class="music-bar"></div>
                <div class="music-bar"></div>
              </div>
            </span>
            <span *ngIf="!isCurrentSong(song) || !isPlaying">▶️</span>
          </button>
        </div>

        <!-- Song Info -->
        <div class="flex-1 min-w-0 ml-4">
          <h4
            class="theme-text font-medium truncate"
            [class.text-spotify-green]="isCurrentSong(song)"
          >
            {{ song.title }}
          </h4>
          <p class="theme-muted text-sm truncate">{{ song.artist }}</p>
        </div>

        <!-- Album -->
        <div class="hidden md:block w-1/4 px-4">
          <p class="theme-muted text-sm truncate">{{ song.album }}</p>
        </div>

        <!-- Duration -->
        <div class="w-16 text-right">
          <span class="theme-muted text-sm">{{
            formatDuration(song.duration)
          }}</span>
        </div>
        <!-- Source audio cachée pour compatibilité -->
        <audio
          *ngIf="song.audioUrl"
          [src]="getAudioUrl(song)"
          controls
          style="display:none"
        ></audio>
        <!-- Actions -->
        <div class="w-12 flex justify-center">
          <button
            (click)="$event.stopPropagation(); toggleLike(song)"
            class="theme-muted hover:theme-text transition-colors opacity-0 group-hover:opacity-100"
            [class.opacity-100]="isLiked(song)"
            [class.text-red-500]="isLiked(song)"
          >
            {{ isLiked(song) ? "❤️" : "🤍" }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class SongListComponent {
  @Input() songs: Song[] = [];
  @Input() likedSongs: Song[] = [];
  @Output() songSelected = new EventEmitter<{ song: Song; index: number }>();
  @Output() songLiked = new EventEmitter<Song>();

  constructor(
    public themeService: ThemeService,
    public audioService: AudioService
  ) {}

  playSong(song: Song, index: number): void {
    // If it's a public song, configure the queue with all public songs
    if (song._id.startsWith("public-")) {
      // Get all songs from the current list and set as queue
      this.audioService.setPublicQueue(this.songs, song._id);
    }

    this.audioService.playSong(song);
    this.songSelected.emit({ song, index });
  }

  toggleLike(song: Song): void {
    this.songLiked.emit(song);
  }

  isLiked(song: Song): boolean {
    return this.likedSongs.some((likedSong) => likedSong._id === song._id);
  }

  isCurrentSong(song: Song): boolean {
    const currentState = this.audioService.getCurrentState();
    return currentState.currentSong?._id === song._id;
  }

  get isPlaying(): boolean {
    return this.audioService.getCurrentState().isPlaying;
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  public getAudioUrl(song: any): string {
    return this.audioService.getAudioUrl(song);
  }
}
