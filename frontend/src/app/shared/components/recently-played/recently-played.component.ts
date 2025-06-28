import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Song } from "../../../core/models/song.model";
import { RecentlyPlayedItem } from "../../../core/models/user.model";
import { AudioService } from "../../../core/services/audio.service";

@Component({
  selector: "app-recently-played",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-8" *ngIf="recentSongs.length > 0">
      <h2 class="text-2xl font-bold theme-text mb-6">Recently Played</h2>
      <div class="flex space-x-4 overflow-x-auto pb-4">
        <div
          *ngFor="let item of recentSongs; let i = index"
          class="recently-played-item relative min-w-[160px]"
          (click)="playSong(item.song, i)"
        >
          <div class="relative">
            <img
              [src]="getImageUrl(item.song.imageUrl)"
              [alt]="item.song.title"
              class="w-40 h-40 rounded-lg object-cover"
            />
            <audio
              *ngIf="item.song.audioUrl"
              [src]="audioService.getAudioUrl(item.song)"
              controls
              style="display:none"
            ></audio>
            <div class="play-overlay">
              <button
                class="bg-spotify-green text-black rounded-full w-12 h-12 flex items-center justify-center"
              >
                ▶️
              </button>
            </div>
          </div>
          <div class="mt-3">
            <h3 class="theme-text font-medium truncate">
              {{ item.song.title }}
            </h3>
            <p class="theme-muted text-sm truncate">{{ item.song.artist }}</p>
            <p class="theme-muted text-xs mt-1">
              {{ getTimeAgo(item.playedAt) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RecentlyPlayedComponent {
  @Input() recentSongs: { song: Song; playedAt: Date }[] = [];
  @Output() songSelected = new EventEmitter<{ song: Song; index: number }>();

  constructor(public audioService: AudioService) {}

  playSong(song: Song, index: number): void {
    this.songSelected.emit({ song, index });
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
  }

  getImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) return "/assets/default-album.png";
    if (imageUrl.startsWith("http")) return imageUrl;
    return "http://localhost:3000" + imageUrl;
  }
}
