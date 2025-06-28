import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { SidebarComponent } from "../../shared/components/sidebar/sidebar.component";
import { SongListComponent } from "../../shared/components/song-list/song-list.component";
import { MusicService } from "../../core/services/music.service";
import { PublicMusicService } from "../../core/services/public-music.service";
import { AudioService } from "../../core/services/audio.service";
import { AuthService } from "../../core/services/auth.service";
import { ThemeService } from "../../core/services/theme.service";
import { Song, Album } from "../../core/models/song.model";

@Component({
  selector: "app-search",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SidebarComponent,
    SongListComponent,
  ],
  template: `
    <div class="flex h-full">
      <app-sidebar></app-sidebar>

      <main class="flex-1 theme-bg overflow-y-auto">
        <div class="p-8">
          <!-- Search Header -->
          <div class="mb-8">
            <h1 class="text-4xl font-bold theme-text mb-6">Search</h1>

            <!-- Search Input -->
            <div class="relative max-w-md">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (input)="onSearch()"
                placeholder="What do you want to listen to?"
                class="input-field w-full pl-12"
                [class.light-mode]="!(themeService.isDarkMode$ | async)"
              />
              <span
                class="absolute left-4 top-1/2 transform -translate-y-1/2 theme-muted"
              >
                🔍
              </span>
            </div>

            <!-- Genre Filters -->
            <div class="flex flex-wrap gap-2 mt-4">
              <button
                *ngFor="let genre of genres"
                (click)="filterByGenre(genre)"
                [class.bg-spotify-green]="selectedGenre === genre"
                [class.text-black]="selectedGenre === genre"
                class="px-4 py-2 theme-surface text-theme-text rounded-full text-sm hover:bg-opacity-80 transition-colors"
              >
                {{ genre }}
              </button>
            </div>

            <!-- Login prompt for non-authenticated users -->
            <div
              *ngIf="!isAuthenticated"
              class="mt-4 p-4 bg-spotify-green bg-opacity-10 border border-spotify-green rounded-lg"
            >
              <p class="theme-text mb-2">
                🎵 Create an account to like songs and save playlists!
              </p>
              <div class="flex space-x-3">
                <a
                  routerLink="/register"
                  class="px-4 py-2 bg-spotify-green text-white rounded-full hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  Create Account
                </a>
                <a
                  routerLink="/login"
                  class="px-4 py-2 border border-spotify-green text-spotify-green rounded-full hover:bg-spotify-green hover:text-white transition-colors text-sm font-medium"
                >
                  Sign In
                </a>
              </div>
            </div>
          </div>

          <!-- Search Results -->
          <div
            *ngIf="
              searchQuery &&
              (searchResults.songs.length > 0 ||
                searchResults.albums.length > 0)
            "
          >
            <!-- Songs -->
            <section *ngIf="searchResults.songs.length > 0" class="mb-8">
              <h2 class="text-2xl font-bold theme-text mb-6">Songs</h2>
              <app-song-list
                [songs]="searchResults.songs"
                (songSelected)="onSongSelected($event)"
                (songLiked)="onSongLiked($event)"
              ></app-song-list>
            </section>

            <!-- Albums -->
            <section *ngIf="searchResults.albums.length > 0">
              <h2 class="text-2xl font-bold theme-text mb-6">Albums</h2>
              <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div
                  *ngFor="let album of searchResults.albums"
                  class="card group"
                  [class.light-mode]="!(themeService.isDarkMode$ | async)"
                >
                  <img
                    [src]="album.imageUrl || '/assets/default-album.png'"
                    [alt]="album.title"
                    class="w-full aspect-square object-cover rounded-lg mb-4"
                  />
                  <h3 class="theme-text font-medium truncate mb-1">
                    {{ album.title }}
                  </h3>
                  <p class="theme-muted text-sm truncate">{{ album.artist }}</p>
                </div>
              </div>
            </section>
          </div>

          <!-- No Results -->
          <div
            *ngIf="
              searchQuery &&
              searchResults.songs.length === 0 &&
              searchResults.albums.length === 0
            "
            class="text-center py-12"
          >
            <h3 class="text-xl theme-text mb-2">
              No results found for "{{ searchQuery }}"
            </h3>
            <p class="theme-muted">
              Please make sure your words are spelled correctly or use less or
              different keywords.
            </p>
          </div>

          <!-- Browse Categories (when no search) -->
          <div
            *ngIf="!searchQuery"
            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <div
              *ngFor="let category of browseCategories"
              (click)="filterByGenre(category.name)"
              class="relative rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform"
              [style.background-color]="category.color"
            >
              <div class="p-6 pb-4">
                <h3 class="text-white font-bold text-xl mb-2">
                  {{ category.name }}
                </h3>
              </div>
              <div class="absolute bottom-0 right-0 p-4">
                <span class="text-4xl">{{ category.emoji }}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class SearchComponent {
  searchQuery = "";
  selectedGenre = "";
  searchResults: { songs: Song[]; albums: Album[] } = { songs: [], albums: [] };
  isAuthenticated = false;

  genres = [
    "Pop",
    "Rock",
    "Hip-Hop",
    "Electronic",
    "Jazz",
    "Classical",
    "Country",
    "R&B",
  ];

  browseCategories = [
    { name: "Pop", color: "#8E44AD", emoji: "🎵" },
    { name: "Rock", color: "#E74C3C", emoji: "🎸" },
    { name: "Hip-Hop", color: "#F39C12", emoji: "🎤" },
    { name: "Electronic", color: "#3498DB", emoji: "🎛️" },
    { name: "Jazz", color: "#9B59B6", emoji: "🎺" },
    { name: "Classical", color: "#2ECC71", emoji: "🎼" },
    { name: "Country", color: "#E67E22", emoji: "🤠" },
    { name: "R&B", color: "#1ABC9C", emoji: "🎶" },
  ];

  constructor(
    private musicService: MusicService,
    private publicMusicService: PublicMusicService,
    private audioService: AudioService,
    private authService: AuthService,
    public themeService: ThemeService
  ) {
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      if (this.isAuthenticated) {
        // Use regular music service for authenticated users
        this.musicService
          .searchSongs(this.searchQuery, this.selectedGenre)
          .subscribe({
            next: (results) => {
              this.searchResults = results;
            },
            error: (error) => console.error("Search error:", error),
          });
      } else {
        // Use public music service for non-authenticated users
        this.publicMusicService.searchPublicSongs(this.searchQuery).subscribe({
          next: (songs) => {
            this.searchResults = { songs, albums: [] };
          },
          error: (error) => console.error("Public search error:", error),
        });
      }
    } else {
      this.searchResults = { songs: [], albums: [] };
    }
  }

  filterByGenre(genre: string): void {
    this.selectedGenre = this.selectedGenre === genre ? "" : genre;
    if (this.searchQuery) {
      this.onSearch();
    } else {
      if (this.isAuthenticated) {
        // Load songs by genre for authenticated users
        this.musicService.searchSongs("", genre).subscribe({
          next: (results) => {
            this.searchResults = results;
            this.searchQuery = genre;
          },
          error: (error) => console.error("Genre filter error:", error),
        });
      } else {
        // Load songs by genre for non-authenticated users
        this.publicMusicService.getSongsByGenre(genre).subscribe({
          next: (songs) => {
            this.searchResults = { songs, albums: [] };
            this.searchQuery = genre;
          },
          error: (error) => console.error("Public genre filter error:", error),
        });
      }
    }
  }

  onSongSelected(event: { song: Song; index: number }): void {
    this.audioService.setQueue(this.searchResults.songs, event.index);
    this.audioService.play();
  }

  onSongLiked(song: Song): void {
    if (!this.isAuthenticated) {
      // Show message to login
      alert("Please create an account to like songs!");
      return;
    }

    this.musicService.likeSong(song._id).subscribe({
      next: () => console.log("Song liked"),
      error: (error) => console.error("Error liking song:", error),
    });
  }
}
