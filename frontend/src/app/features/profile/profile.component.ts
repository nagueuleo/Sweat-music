import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { MusicService } from '../../core/services/music.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div class="flex h-full">
      <app-sidebar></app-sidebar>
      
      <main class="flex-1 bg-gradient-to-b from-spotify-dark to-black overflow-y-auto">
        <div class="p-8">
          <!-- Profile Header -->
          <div class="flex items-center space-x-6 mb-8 p-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
            <div class="w-48 h-48 bg-gray-600 rounded-full flex items-center justify-center">
              <img 
                *ngIf="user?.profileImage" 
                [src]="user?.profileImage" 
                [alt]="user?.username"
                class="w-full h-full rounded-full object-cover"
              >
              <span *ngIf="!user?.profileImage" class="text-6xl">👤</span>
            </div>
            <div>
              <p class="text-spotify-gray text-sm uppercase tracking-wide">Profile</p>
              <h1 class="text-5xl font-bold text-white mb-4">{{ user?.username }}</h1>
              <div class="flex items-center space-x-4 text-sm text-spotify-gray">
                <span>{{ user?.followers?.length || 0 }} followers</span>
                <span>•</span>
                <span>{{ user?.following?.length || 0 }} following</span>
                <span>•</span>
                <span>{{ user?.playlists?.length || 0 }} playlists</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-4 mb-8">
            <button 
              (click)="toggleEditMode()"
              class="btn-primary"
            >
              {{ isEditing ? 'Cancel' : 'Edit Profile' }}
            </button>
            
            <button 
              (click)="exportStats()"
              class="btn-secondary"
            >
              Export Listening Stats
            </button>
          </div>

          <!-- Edit Form -->
          <div *ngIf="isEditing" class="bg-spotify-dark p-6 rounded-lg mb-8">
            <h3 class="text-xl font-bold text-white mb-4">Edit Profile</h3>
            <form (ngSubmit)="saveProfile()" #profileForm="ngForm">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-spotify-gray mb-2">Username</label>
                  <input
                    type="text"
                    [(ngModel)]="editForm.username"
                    name="username"
                    required
                    class="input-field w-full"
                  >
                </div>
                
                <div>
                  <label class="block text-spotify-gray mb-2">Email</label>
                  <input
                    type="email"
                    [(ngModel)]="editForm.email"
                    name="email"
                    required
                    class="input-field w-full"
                  >
                </div>
              </div>
              
              <div class="flex space-x-4 mt-6">
                <button type="submit" class="btn-primary">Save Changes</button>
                <button type="button" (click)="toggleEditMode()" class="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>

          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-spotify-dark p-6 rounded-lg">
              <h3 class="text-lg font-semibold text-white mb-2">Liked Songs</h3>
              <p class="text-3xl font-bold text-spotify-green">{{ stats.likedSongs }}</p>
            </div>
            
            <div class="bg-spotify-dark p-6 rounded-lg">
              <h3 class="text-lg font-semibold text-white mb-2">Total Plays</h3>
              <p class="text-3xl font-bold text-spotify-green">{{ stats.totalPlays }}</p>
            </div>
            
            <div class="bg-spotify-dark p-6 rounded-lg">
              <h3 class="text-lg font-semibold text-white mb-2">Hours Listened</h3>
              <p class="text-3xl font-bold text-spotify-green">{{ stats.hoursListened }}</p>
            </div>
          </div>

          <!-- Recent Activity -->
          <section class="mb-8">
            <h2 class="text-2xl font-bold text-white mb-6">Recent Activity</h2>
            <div class="space-y-4">
              <div 
                *ngFor="let activity of recentActivity" 
                class="flex items-center p-4 bg-spotify-dark rounded-lg"
              >
                <div class="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center mr-4">
                  <span class="text-black font-bold">🎵</span>
                </div>
                <div class="flex-1">
                  <p class="text-white font-medium">{{ activity.action }}</p>
                  <p class="text-spotify-gray text-sm">{{ activity.timestamp | date:'short' }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Top Artists -->
          <section>
            <h2 class="text-2xl font-bold text-white mb-6">Your Top Artists</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div 
                *ngFor="let artist of topArtists"
                class="text-center"
              >
                <div class="w-full aspect-square bg-gray-600 rounded-full mb-2 flex items-center justify-center">
                  <span class="text-2xl">🎤</span>
                </div>
                <h3 class="text-white font-medium truncate">{{ artist.name }}</h3>
                <p class="text-spotify-gray text-sm">{{ artist.plays }} plays</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isEditing = false;
  editForm = {
    username: '',
    email: ''
  };

  stats = {
    likedSongs: 0,
    totalPlays: 0,
    hoursListened: 0
  };

  recentActivity: any[] = [];
  topArtists: any[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private musicService: MusicService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadUserStats();
  }

  private loadUserProfile(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.editForm = {
          username: user.username,
          email: user.email
        };
      }
    });
  }

  private loadUserStats(): void {
    // Load liked songs count
    this.musicService.getLikedSongs().subscribe({
      next: (songs) => {
        this.stats.likedSongs = songs.length;
      },
      error: (error) => console.error('Error loading liked songs:', error)
    });

    // Load play history for stats
    this.musicService.getPlayHistory().subscribe({
      next: (history) => {
        this.stats.totalPlays = history.length;
        
        // Calculate hours listened (assuming average 3 minutes per song)
        this.stats.hoursListened = Math.round((history.length * 3) / 60);

        // Create recent activity
        this.recentActivity = history.slice(0, 5).map(h => ({
          action: `Played "${h.song.title}" by ${h.song.artist}`,
          timestamp: h.playedAt
        }));

        // Calculate top artists
        const artistCounts: { [key: string]: number } = {};
        history.forEach(h => {
          artistCounts[h.song.artist] = (artistCounts[h.song.artist] || 0) + 1;
        });

        this.topArtists = Object.entries(artistCounts)
          .map(([name, plays]) => ({ name, plays }))
          .sort((a, b) => b.plays - a.plays)
          .slice(0, 6);
      },
      error: (error) => console.error('Error loading play history:', error)
    });
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing && this.user) {
      // Reset form
      this.editForm = {
        username: this.user.username,
        email: this.user.email
      };
    }
  }

  saveProfile(): void {
    this.userService.updateProfile(this.editForm).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.isEditing = false;
        console.log('Profile updated successfully');
      },
      error: (error) => {
        console.error('Error updating profile:', error);
      }
    });
  }

  exportStats(): void {
    this.musicService.exportListeningStats().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'listening-stats.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error exporting stats:', error);
      }
    });
  }
}