import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { SongListComponent } from '../../shared/components/song-list/song-list.component';
import { PlaylistService } from '../../core/services/playlist.service';
import { MusicService } from '../../core/services/music.service';
import { AudioService } from '../../core/services/audio.service';
import { Playlist } from '../../core/models/playlist.model';
import { Song } from '../../core/models/song.model';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent, SongListComponent],
  template: `
    <div class="flex h-full">
      <app-sidebar></app-sidebar>
      
      <main class="flex-1 bg-gradient-to-b from-spotify-dark to-black overflow-y-auto" [class.light-mode]="!(themeService.isDarkMode$ | async)">
        <div class="p-2 sm:p-4 md:p-8">
          <!-- Header -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Your Library</h1>
            <button 
              (click)="openCreatePlaylistModal()"
              class="btn-primary w-full sm:w-auto"
            >
              Create Playlist
            </button>
          </div>

          <!-- Create Playlist Modal -->
          <div *ngIf="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div class="bg-spotify-dark p-8 rounded-lg w-full max-w-md shadow-lg relative">
              <button (click)="closeCreatePlaylistModal()" class="absolute top-2 right-2 text-white text-2xl">&times;</button>
              <h2 class="text-2xl font-bold text-white mb-4">Create Playlist</h2>
              <form (ngSubmit)="submitCreatePlaylist()" #playlistForm="ngForm">
                <div class="mb-4">
                  <label class="block text-spotify-gray mb-2">Playlist Name</label>
                  <input type="text" [(ngModel)]="newPlaylist.name" name="name" required class="input-field w-full" placeholder="Playlist name">
                </div>
                <div class="mb-4">
                  <label class="block text-spotify-gray mb-2">Description</label>
                  <textarea [(ngModel)]="newPlaylist.description" name="description" class="input-field w-full" placeholder="Description (optional)"></textarea>
                </div>
                <div class="mb-4">
                  <label class="block text-spotify-gray mb-2">Cover Image (optional)</label>
                  <input type="file" (change)="onImageSelected($event)" accept="image/*" class="input-field w-full">
                </div>
                <div class="flex justify-end">
                  <button type="button" (click)="closeCreatePlaylistModal()" class="mr-2 px-4 py-2 rounded bg-gray-700 text-white">Cancel</button>
                  <button type="submit" [disabled]="!playlistForm.form.valid" class="btn-primary">Create</button>
                </div>
              </form>
            </div>
          </div>

          <!-- Filter Tabs -->
          <div class="flex space-x-4 mb-8">
            <button
              *ngFor="let tab of tabs"
              (click)="activeTab = tab"
              [class.bg-white]="activeTab === tab"
              [class.text-black]="activeTab === tab"
              [class.bg-spotify-black]="activeTab !== tab"
              [class.text-white]="activeTab !== tab"
              class="px-4 py-2 rounded-full font-medium transition-colors"
            >
              {{ tab }}
            </button>
          </div>

          <!-- Playlists -->
          <div *ngIf="activeTab === 'Playlists'">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8" *ngIf="playlists.length > 0">
              <div 
                *ngFor="let playlist of playlists"
                [routerLink]="['/playlist', playlist._id]"
                class="card group"
              >
                <img 
                  [src]="getImageUrl(playlist.imageUrl)" 
                  [alt]="playlist.name"
                  class="w-full aspect-square object-cover rounded-lg mb-4"
                  (error)="onImgError($event)"
                >
                <h3 class="text-white font-medium truncate mb-1">{{ playlist.name }}</h3>
                <p class="text-spotify-gray text-sm truncate">{{ playlist.songs.length }} songs</p>
                <button class="absolute bottom-4 right-4 bg-spotify-green text-black rounded-full w-12 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                  ▶️
                </button>
              </div>
            </div>

            <div *ngIf="playlists.length === 0" class="text-center py-12">
              <h3 class="text-xl text-white mb-2">Create your first playlist</h3>
              <p class="text-spotify-gray mb-4">It's easy, we'll help you</p>
              <button (click)="openCreatePlaylistModal()" class="btn-primary">Create playlist</button>
            </div>
          </div>

          <!-- Liked Songs -->
          <div *ngIf="activeTab === 'Liked Songs'">
            <div *ngIf="likedSongs.length > 0">
              <div class="flex items-center space-x-6 mb-8 p-6 bg-gradient-to-b from-purple-600 to-purple-800 rounded-lg">
                <div class="w-48 h-48 bg-gradient-to-br from-purple-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <span class="text-6xl">❤️</span>
                </div>
                <div>
                  <p class="text-spotify-gray text-sm uppercase tracking-wide">Playlist</p>
                  <h1 class="text-5xl font-bold text-white mb-4">Liked Songs</h1>
                  <p class="text-spotify-gray">{{ likedSongs.length }} songs</p>
                </div>
              </div>

              <app-song-list 
                [songs]="likedSongs"
                (songSelected)="onSongSelected($event)"
                (songLiked)="onSongUnliked($event)"
              ></app-song-list>
            </div>

            <div *ngIf="likedSongs.length === 0" class="text-center py-12">
              <span class="text-6xl mb-4 block">❤️</span>
              <h3 class="text-xl text-white mb-2">Songs you like will appear here</h3>
              <p class="text-spotify-gray">Save songs by tapping the heart icon.</p>
            </div>
          </div>

          <!-- Recently Played -->
          <div *ngIf="activeTab === 'Recently Played'">
            <div *ngIf="recentlyPlayed.length > 0">
              <app-song-list 
                [songs]="recentlyPlayed"
                (songSelected)="onSongSelected($event)"
                (songLiked)="onSongLiked($event)"
              ></app-song-list>
            </div>

            <div *ngIf="recentlyPlayed.length === 0" class="text-center py-12">
              <h3 class="text-xl text-white mb-2">Nothing played yet</h3>
              <p class="text-spotify-gray">Songs you play will appear here.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class LibraryComponent implements OnInit {
  activeTab = 'Playlists';
  tabs = ['Playlists', 'Liked Songs', 'Recently Played'];
  
  playlists: Playlist[] = [];
  likedSongs: Song[] = [];
  recentlyPlayed: Song[] = [];

  showCreateModal = false;
  newPlaylist = { name: '', description: '' };
  selectedImageFile: File | null = null;

  constructor(
    private playlistService: PlaylistService,
    private musicService: MusicService,
    private audioService: AudioService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.loadLibraryData();
  }

  openCreatePlaylistModal(): void {
    this.showCreateModal = true;
    this.newPlaylist = { name: '', description: '' };
    this.selectedImageFile = null;
  }

  closeCreatePlaylistModal(): void {
    this.showCreateModal = false;
  }

  onImageSelected(event: any): void {
    this.selectedImageFile = event.target.files[0];
  }

  submitCreatePlaylist(): void {
    console.log('submitCreatePlaylist called', this.newPlaylist);
    if (!this.newPlaylist.name) return;
    const formData = new FormData();
    formData.append('name', this.newPlaylist.name);
    formData.append('description', this.newPlaylist.description || '');
    formData.append('isPublic', 'false');
    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile);
    }
    this.playlistService.createPlaylist(formData).subscribe({
      next: (playlist) => {
        this.playlists.push(playlist);
        this.closeCreatePlaylistModal();
      },
      error: (error) => console.error('Error creating playlist:', error)
    });
  }

  private loadLibraryData(): void {
    // Load user playlists
    this.playlistService.getUserPlaylists().subscribe({
      next: (playlists) => {
        this.playlists = playlists;
      },
      error: (error) => console.error('Error loading playlists:', error)
    });

    // Load liked songs
    this.musicService.getLikedSongs().subscribe({
      next: (songs) => {
        this.likedSongs = songs;
      },
      error: (error) => console.error('Error loading liked songs:', error)
    });

    // Load recently played
    this.musicService.getPlayHistory().subscribe({
      next: (history) => {
        this.recentlyPlayed = history.map(h => h.song);
      },
      error: (error) => console.error('Error loading history:', error)
    });
  }

  onSongSelected(event: { song: Song, index: number }): void {
    let songsToPlay: Song[] = [];
    
    if (this.activeTab === 'Liked Songs') {
      songsToPlay = this.likedSongs;
    } else if (this.activeTab === 'Recently Played') {
      songsToPlay = this.recentlyPlayed;
    }

    this.audioService.setQueue(songsToPlay, event.index);
    this.audioService.play();
  }

  onSongLiked(song: Song): void {
    this.musicService.likeSong(song._id).subscribe({
      next: () => console.log('Song liked'),
      error: (error) => console.error('Error liking song:', error)
    });
  }

  onSongUnliked(song: Song): void {
    this.musicService.unlikeSong(song._id).subscribe({
      next: () => {
        this.likedSongs = this.likedSongs.filter(s => s._id !== song._id);
      },
      error: (error) => console.error('Error unliking song:', error)
    });
  }

  getImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) return '/assets/default-playlist.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    return 'http://localhost:3000' + imageUrl;
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith('/assets/default-playlist.png')) {
      img.src = '/assets/default-playlist.png';
    }
  }
}