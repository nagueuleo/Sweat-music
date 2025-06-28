import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SidebarComponent } from "../../shared/components/sidebar/sidebar.component";
import { SongListComponent } from "../../shared/components/song-list/song-list.component";
import { RecentlyPlayedComponent } from "../../shared/components/recently-played/recently-played.component";
import { MusicService } from "../../core/services/music.service";
import { PublicMusicService } from "../../core/services/public-music.service";
import { AudioService } from "../../core/services/audio.service";
import { AuthService } from "../../core/services/auth.service";
import { ThemeService } from "../../core/services/theme.service";
import { Song, Album } from "../../core/models/song.model";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    SongListComponent,
    RecentlyPlayedComponent,
  ],
  template: `
    <div class="flex h-full">
      <app-sidebar></app-sidebar>

      <main class="flex-1 theme-bg overflow-y-auto">
        <div class="p-8">
          <!-- Header -->
          <div class="mb-8">
            <h1 class="text-4xl font-bold theme-text mb-2">
              {{ getGreeting() }}
            </h1>
            <p class="theme-muted">
              {{
                isAuthenticated
                  ? "Discover new music and enjoy your favorites"
                  : "Discover amazing music and create your account to save your favorites"
              }}
            </p>

            <!-- Login prompt for non-authenticated users -->
            <div
              *ngIf="!isAuthenticated"
              class="mt-4 p-4 bg-spotify-green bg-opacity-10 border border-spotify-green rounded-lg"
            >
              <p class="theme-text mb-2">
                🎵 Ready to start your musical journey?
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

          <!-- Recently Played (only for authenticated users) -->
          <app-recently-played
            *ngIf="isAuthenticated && recentSongs.length > 0"
            [recentSongs]="recentSongs"
            (songSelected)="onRecentSongSelected($event)"
          >
          </app-recently-played>

          <!-- Quick Access -->
          <section class="mb-8" *ngIf="quickAccessItems.length > 0">
            <h2 class="text-2xl font-bold theme-text mb-6">Quick Access</h2>
            <div
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
            >
              <div
                *ngFor="let item of quickAccessItems"
                (click)="playQuickAccess(item)"
                class="theme-surface hover:bg-gray-800 rounded-lg p-4 flex items-center cursor-pointer transition-all duration-200 transform hover:scale-105 group"
                [class.hover:bg-gray-100]="!(themeService.isDarkMode$ | async)"
              >
                <img
                  [src]="getImageUrl(item.imageUrl)"
                  [alt]="item.title"
                  class="w-8 h-8 rounded-full border border-gray-700 mr-3 shadow-sm object-cover"
                />
                <div class="flex-1 min-w-0">
                  <h3 class="theme-text font-medium truncate">
                    {{ item.title }}
                  </h3>
                  <p class="theme-muted text-sm truncate">{{ item.artist }}</p>
                </div>
                <button
                  class="theme-text opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ▶️
                </button>
              </div>
            </div>
          </section>

          <!-- Popular Albums -->
          <section class="mb-8" *ngIf="popularAlbums.length > 0">
            <h2 class="text-2xl font-bold theme-text mb-6">Popular Albums</h2>
            <div
              class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8"
            >
              <div
                *ngFor="let album of popularAlbums.slice(0, 6)"
                (click)="playAlbum(album)"
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
                <button
                  class="absolute bottom-4 right-4 bg-spotify-green text-black rounded-full w-12 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200"
                >
                  ▶️
                </button>
              </div>
            </div>
          </section>

          <!-- Recommendations (only for authenticated users) -->
          <section
            *ngIf="isAuthenticated && recommendations.length > 0"
            class="mb-8"
          >
            <h2 class="text-2xl font-bold theme-text mb-6">
              Recommended for You
            </h2>
            <app-song-list
              [songs]="recommendations"
              (songSelected)="onSongSelected($event)"
              (songLiked)="onSongLiked($event)"
            ></app-song-list>
          </section>

          <!-- Popular Songs -->
          <section *ngIf="popularSongs.length > 0">
            <h2 class="text-2xl font-bold theme-text mb-6">
              Popular Right Now
            </h2>
            <app-song-list
              [songs]="popularSongs"
              (songSelected)="onSongSelected($event)"
              (songLiked)="onSongLiked($event)"
            ></app-song-list>
          </section>

          <!-- Loading State -->
          <div *ngIf="isLoading" class="flex items-center justify-center py-12">
            <div class="loading-spinner"></div>
            <span class="ml-3 theme-muted">Loading music...</span>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  recentSongs: { song: Song; playedAt: Date }[] = [];
  popularSongs: Song[] = [];
  popularAlbums: Album[] = [];
  recommendations: Song[] = [];
  quickAccessItems: Song[] = [];
  isLoading = true;
  isAuthenticated = false;

  constructor(
    private musicService: MusicService,
    private publicMusicService: PublicMusicService,
    private audioService: AudioService,
    private authService: AuthService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;

    if (this.isAuthenticated) {
      // Load data for authenticated users
      this.loadAuthenticatedUserData();
    } else {
      // Load public data for non-authenticated users
      this.loadPublicData();
    }
  }

  private loadAuthenticatedUserData(): void {
    // Load popular songs
    this.musicService.getAllSongs(1, 20).subscribe({
      next: (response) => {
        this.popularSongs = response.songs;
        this.quickAccessItems = response.songs.slice(0, 6);
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error("Error loading songs:", error);
        this.checkLoadingComplete();
      },
    });

    // Load albums
    this.musicService.getAllAlbums().subscribe({
      next: (albums) => {
        this.popularAlbums = albums;
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error("Error loading albums:", error);
        this.checkLoadingComplete();
      },
    });

    // Load recommendations
    this.musicService.getRecommendations().subscribe({
      next: (songs) => {
        this.recommendations = songs;
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error("Error loading recommendations:", error);
        this.checkLoadingComplete();
      },
    });

    // Load recent songs
    this.musicService.getPlayHistory().subscribe({
      next: (history) => {
        // Filter to unique songs by _id
        const uniqueMap = new Map();
        history.forEach((h) => {
          if (h.song && !uniqueMap.has(h.song._id)) {
            uniqueMap.set(h.song._id, { song: h.song, playedAt: h.playedAt });
          }
        });
        this.recentSongs = Array.from(uniqueMap.values()).slice(0, 10);
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error("Error loading history:", error);
        this.checkLoadingComplete();
      },
    });
  }

  private loadPublicData(): void {
    // Load public songs for non-authenticated users
    this.publicMusicService.getPublicSongs().subscribe({
      next: (songs) => {
        this.popularSongs = songs;
        this.quickAccessItems = songs.slice(0, 6);
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error("Error loading public songs:", error);
        this.checkLoadingComplete();
      },
    });

    // Create mock albums from public songs
    const mockAlbums: Album[] = [
      {
        _id: "album-1",
        title: "After Hours",
        artist: "The Weeknd",
        genre: "Pop",
        imageUrl: "/cover-images/1.jpg",
        songs: [],
        releaseDate: new Date("2020-03-20"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: "album-2",
        title: "Fine Line",
        artist: "Harry Styles",
        genre: "Pop",
        imageUrl: "/cover-images/2.jpg",
        songs: [],
        releaseDate: new Date("2019-12-13"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: "album-3",
        title: "Future Nostalgia",
        artist: "Dua Lipa",
        genre: "Pop",
        imageUrl: "/cover-images/3.jpg",
        songs: [],
        releaseDate: new Date("2020-03-27"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: "album-4",
        title: "SOUR",
        artist: "Olivia Rodrigo",
        genre: "Pop",
        imageUrl: "/cover-images/4.jpg",
        songs: [],
        releaseDate: new Date("2021-05-14"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: "album-5",
        title: "F*CK LOVE 3: OVER YOU",
        artist: "The Kid LAROI",
        genre: "Hip-Hop",
        imageUrl: "/cover-images/5.jpg",
        songs: [],
        releaseDate: new Date("2021-07-09"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: "album-6",
        title: "= (Equals)",
        artist: "Ed Sheeran",
        genre: "Pop",
        imageUrl: "/cover-images/6.jpg",
        songs: [],
        releaseDate: new Date("2021-09-10"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    this.popularAlbums = mockAlbums;
    this.checkLoadingComplete();

    // Mark other sections as loaded for non-authenticated users
    this.checkLoadingComplete();
    this.checkLoadingComplete();
  }

  private checkLoadingComplete(): void {
    // Simple loading state management
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  getGreeting(): string {
    if (!this.isAuthenticated) {
      return "Welcome to Sweat Music";
    }

    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good morning";
    } else if (hour < 18) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  }

  playQuickAccess(song: Song): void {
    this.audioService.playSong(song);
  }

  playAlbum(album: Album): void {
    if (album.songs && album.songs.length > 0) {
      this.audioService.setQueue(album.songs, 0);
      this.audioService.play();
    }
  }

  onRecentSongSelected(event: { song: Song; index: number }): void {
    const songs = this.recentSongs.map((rs) => rs.song);
    this.audioService.setQueue(songs, event.index);
    this.audioService.play();
  }

  onSongSelected(event: { song: Song; index: number }): void {
    // Determine which song list to use based on the song type
    let songsToPlay: Song[];

    if (event.song._id.startsWith("public-")) {
      // Public song - use popularSongs (public songs)
      songsToPlay = this.popularSongs;
    } else if (this.recommendations.length > 0) {
      // Backend song with recommendations available
      songsToPlay = this.recommendations;
    } else {
      // Fallback to popularSongs
      songsToPlay = this.popularSongs;
    }

    console.log(
      "Playing song:",
      event.song.title,
      "from list:",
      songsToPlay.length,
      "songs"
    );
    this.audioService.setQueue(songsToPlay, event.index);
    this.audioService.play();
  }

  onSongLiked(song: Song): void {
    // Check if user is authenticated
    if (!this.isAuthenticated) {
      alert("Please create an account to like songs!");
      return;
    }

    // Check if it's a public song (can't be liked)
    if (song._id.startsWith("public-")) {
      alert(
        "Public songs cannot be liked. Please connect to access the full library."
      );
      return;
    }

    this.musicService.likeSong(song._id).subscribe({
      next: () => console.log("Song liked"),
      error: (error) => console.error("Error liking song:", error),
    });
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
}
