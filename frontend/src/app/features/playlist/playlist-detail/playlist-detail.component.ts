import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { SongListComponent } from '../../../shared/components/song-list/song-list.component';
import { PlaylistService } from '../../../core/services/playlist.service';
import { AudioService } from '../../../core/services/audio.service';
import { Playlist } from '../../../core/models/playlist.model';
import { Song } from '../../../core/models/song.model';
import { MusicService } from '../../../core/services/music.service';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [CommonModule, SidebarComponent, SongListComponent, FormsModule],
  template: `
    <div class="flex h-full">
      <app-sidebar></app-sidebar>
      
      <main class="flex-1 bg-gradient-to-b from-spotify-dark to-black overflow-y-auto" [class.light-mode]="!(themeService.isDarkMode$ | async)">
        <div *ngIf="playlist" class="p-2 sm:p-4 md:p-8">
          <!-- Playlist Header -->
          <div class="flex flex-col md:flex-row items-center md:space-x-6 mb-8 p-4 sm:p-6 bg-gradient-to-b from-purple-600 to-purple-800 rounded-lg">
            <img 
              [src]="getImageUrl(playlist.imageUrl)" 
              [alt]="playlist.name"
              class="w-32 h-32 sm:w-48 sm:h-48 rounded-lg shadow-lg mb-4 md:mb-0"
              (error)="onImgError($event)"
            >
            <div class="flex-1 w-full">
              <p class="text-spotify-gray text-xs sm:text-sm uppercase tracking-wide">Playlist</p>
              <h1 class="text-2xl sm:text-5xl font-bold text-white mb-2 sm:mb-4">{{ playlist.name }}</h1>
              <p class="text-spotify-gray mb-2" *ngIf="playlist.description">{{ playlist.description }}</p>
              <div class="flex flex-wrap items-center space-x-2 text-xs sm:text-sm text-spotify-gray">
                <span>{{ playlist.owner.username }}</span>
                <span>•</span>
                <span>{{ playlist.songs.length }} songs</span>
                <span *ngIf="playlist.followers.length > 0">•</span>
                <span *ngIf="playlist.followers.length > 0">{{ playlist.followers.length }} followers</span>
              </div>
            </div>
            <!-- Edit and Add Songs Buttons (Owner Only) -->
            <div *ngIf="isOwner" class="ml-0 md:ml-auto flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 mt-4 md:mt-0 w-full md:w-auto">
              <button (click)="openEditModal()" class="px-4 py-2 rounded bg-spotify-green text-black font-semibold hover:bg-green-500 transition w-full md:w-auto">Edit Playlist</button>
              <button (click)="openAddSongModal()" class="px-4 py-2 rounded bg-spotify-gray text-white font-semibold hover:bg-gray-700 transition w-full md:w-auto">Add Songs</button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-4 mb-8">
            <button 
              (click)="playPlaylist()"
              class="bg-spotify-green text-black rounded-full w-14 h-14 flex items-center justify-center hover:scale-105 transition-transform"
            >
              ▶️
            </button>
            
            <button 
              *ngIf="!isOwner"
              (click)="toggleFollow()"
              class="btn-secondary"
            >
              {{ isFollowing ? 'Unfollow' : 'Follow' }}
            </button>

            <button class="text-spotify-gray hover:text-white transition-colors">
              ⋯
            </button>
          </div>

          <!-- Songs List -->
          <div *ngIf="playlist.songs.length > 0">
            <app-song-list 
              [songs]="playlist.songs"
              (songSelected)="onSongSelected($event)"
              (songLiked)="onSongLiked($event)"
            ></app-song-list>
          </div>

          <!-- Empty Playlist -->
          <div *ngIf="playlist.songs.length === 0" class="text-center py-12">
            <h3 class="text-xl text-white mb-2">This playlist is empty</h3>
            <p class="text-spotify-gray">Add some songs to get started.</p>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="!playlist" class="flex items-center justify-center h-full">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green mx-auto mb-4"></div>
            <p class="text-spotify-gray">Loading playlist...</p>
          </div>
        </div>

        <!-- Edit Playlist Modal -->
        <div *ngIf="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div class="bg-spotify-dark p-8 rounded-lg shadow-lg w-full max-w-md relative">
            <button (click)="closeEditModal()" class="absolute top-2 right-2 text-white text-2xl">&times;</button>
            <h2 class="text-2xl font-bold text-white mb-4">Edit Playlist</h2>
            <form (ngSubmit)="submitEdit()" #editForm="ngForm">
              <div class="mb-4">
                <label class="block text-white mb-1">Name</label>
                <input [(ngModel)]="editData.name" name="name" required class="w-full px-3 py-2 rounded bg-spotify-gray text-white" />
              </div>
              <div class="mb-4">
                <label class="block text-white mb-1">Description</label>
                <textarea [(ngModel)]="editData.description" name="description" class="w-full px-3 py-2 rounded bg-spotify-gray text-white"></textarea>
              </div>
              <div class="mb-4">
                <label class="block text-white mb-1">Image</label>
                <input type="file" (change)="onEditImageChange($event)" accept="image/*" class="w-full text-white" />
              </div>
              <div class="mb-4 flex items-center">
                <input type="checkbox" [(ngModel)]="editData.isPublic" name="isPublic" id="isPublic" class="mr-2" />
                <label for="isPublic" class="text-white">Public Playlist</label>
              </div>
              <button type="submit" [disabled]="editLoading" class="w-full py-2 rounded bg-spotify-green text-black font-semibold hover:bg-green-500 transition">Save Changes</button>
            </form>
          </div>
        </div>

        <!-- Add Songs Modal -->
        <div *ngIf="showAddSongModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div class="bg-spotify-dark p-8 rounded-lg shadow-lg w-full max-w-2xl relative">
            <button (click)="closeAddSongModal()" class="absolute top-2 right-2 text-white text-2xl">&times;</button>
            <h2 class="text-2xl font-bold text-white mb-4">Add Songs to Playlist</h2>
            <input [(ngModel)]="songSearch" (input)="searchSongs()" placeholder="Search songs..." class="w-full mb-4 px-3 py-2 rounded bg-spotify-gray text-white" />
            <div class="max-h-96 overflow-y-auto">
              <div *ngFor="let song of filteredSongs" class="flex items-center justify-between py-2 border-b border-spotify-gray">
                <div>
                  <span class="text-white font-semibold">{{ song.title }}</span>
                  <span class="text-spotify-gray ml-2">{{ song.artist }}</span>
                </div>
                <button (click)="addSong(song._id)" [disabled]="addingSongId === song._id" class="px-3 py-1 rounded bg-spotify-green text-black font-semibold hover:bg-green-500 transition">Add</button>
              </div>
              <div *ngIf="filteredSongs.length === 0" class="text-spotify-gray text-center py-8">No songs found.</div>
            </div>
          </div>
        </div>

        <!-- Toasts -->
        <div *ngIf="toastMessage" class="fixed bottom-6 right-6 z-50 bg-spotify-green text-black px-6 py-3 rounded shadow-lg font-semibold animate-fade-in">
          {{ toastMessage }}
        </div>
      </main>
    </div>
  `
})
export class PlaylistDetailComponent implements OnInit {
  playlist: Playlist | null = null;
  isOwner = false;
  isFollowing = false;

  // Edit modal state
  showEditModal = false;
  editData: any = { name: '', description: '', isPublic: false };
  editImageFile: File | null = null;
  editLoading = false;

  // Add song modal state
  showAddSongModal = false;
  allSongs: Song[] = [];
  filteredSongs: Song[] = [];
  songSearch = '';
  addingSongId: string | null = null;

  // Toast
  toastMessage = '';
  toastTimeout: any;

  constructor(
    private route: ActivatedRoute,
    private playlistService: PlaylistService,
    private audioService: AudioService,
    private musicService: MusicService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const playlistId = params['id'];
      this.loadPlaylist(playlistId);
    });
  }

  private loadPlaylist(id: string): void {
    this.playlistService.getPlaylistById(id).subscribe({
      next: (playlist) => {
        this.playlist = playlist;
        // Check if current user is the owner
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        this.isOwner = playlist.owner && user && playlist.owner._id === user._id;
        // TODO: Set isFollowing if needed
      },
      error: (error) => {
        this.showToast('Error loading playlist');
      }
    });
  }

  // --- Edit Playlist Modal ---
  openEditModal() {
    if (!this.playlist) return;
    this.editData = {
      name: this.playlist.name,
      description: this.playlist.description,
      isPublic: this.playlist.isPublic
    };
    this.editImageFile = null;
    this.showEditModal = true;
  }
  closeEditModal() { this.showEditModal = false; }
  onEditImageChange(event: any) {
    const file = event.target.files[0];
    if (file) this.editImageFile = file;
  }
  submitEdit() {
    if (!this.playlist) return;
    this.editLoading = true;
    const formData = new FormData();
    formData.append('name', this.editData.name);
    formData.append('description', this.editData.description || '');
    formData.append('isPublic', this.editData.isPublic ? 'true' : 'false');
    if (this.editImageFile) formData.append('image', this.editImageFile);
    this.playlistService.updatePlaylist(this.playlist._id, formData).subscribe({
      next: (res: any) => {
        this.showToast('Playlist updated!');
        this.playlist = res.playlist;
        this.showEditModal = false;
        this.editLoading = false;
      },
      error: () => {
        this.showToast('Failed to update playlist');
        this.editLoading = false;
      }
    });
  }

  // --- Add Songs Modal ---
  openAddSongModal() {
    this.showAddSongModal = true;
    this.loadAllSongs();
  }
  closeAddSongModal() { this.showAddSongModal = false; }
  loadAllSongs() {
    if (!this.musicService) return;
    this.musicService.getAllSongs(1, 1000).subscribe((res: any) => {
      this.allSongs = res.songs;
      this.filterSongs();
    });
  }
  searchSongs() { this.filterSongs(); }
  filterSongs() {
    const q = this.songSearch.toLowerCase();
    this.filteredSongs = this.allSongs.filter(s =>
      s.title.toLowerCase().includes(q) ||
      (s.artist && s.artist.toLowerCase().includes(q))
    );
    // Exclude already in playlist
    if (this.playlist) {
      const ids = new Set(
        this.playlist.songs.map(s => typeof s === 'string' ? s : s._id)
      );
      this.filteredSongs = this.filteredSongs.filter(s => !ids.has(s._id));
    }
  }
  addSong(songId: string) {
    if (!this.playlist) return;
    this.addingSongId = songId;
    this.playlistService.addSongToPlaylist(this.playlist._id, songId).subscribe({
      next: () => {
        this.showToast('Song added!');
        this.loadPlaylist(this.playlist!._id);
        this.addingSongId = null;
      },
      error: (err) => {
        if (err && err.error && err.error.message) {
          this.showToast(err.error.message);
        } else {
          this.showToast('Failed to add song');
        }
        this.loadPlaylist(this.playlist!._id);
        this.addingSongId = null;
      }
    });
  }

  // --- Toast ---
  showToast(msg: string) {
    this.toastMessage = msg;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.toastMessage = '', 2500);
  }

  playPlaylist(): void {
    if (this.playlist && this.playlist.songs.length > 0) {
      this.audioService.setQueue(this.playlist.songs, 0);
      this.audioService.play();
    }
  }

  toggleFollow(): void {
    if (!this.playlist) return;
    if (this.isFollowing) {
      this.playlistService.unfollowPlaylist(this.playlist._id).subscribe({
        next: () => { this.isFollowing = false; },
        error: () => this.showToast('Error unfollowing playlist')
      });
    } else {
      this.playlistService.followPlaylist(this.playlist._id).subscribe({
        next: () => { this.isFollowing = true; },
        error: () => this.showToast('Error following playlist')
      });
    }
  }

  onSongSelected(event: { song: Song, index: number }): void {
    if (this.playlist) {
      this.audioService.setQueue(this.playlist.songs, event.index);
      this.audioService.play();
    }
  }

  onSongLiked(song: Song): void {
    // Implementation for liking songs
    this.showToast('Liked: ' + song.title);
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith('/assets/default-playlist.png')) {
      img.src = '/assets/default-playlist.png';
    }
  }

  getImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) return '/assets/default-playlist.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    return 'http://localhost:3000' + imageUrl;
  }
}