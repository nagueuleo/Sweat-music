import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SidebarComponent } from "../../../shared/components/sidebar/sidebar.component";
import { AdminService } from "../../../core/services/admin.service";
import { Song, Album } from "../../../core/models/song.model";
import { User } from "../../../core/models/user.model";
import { MusicService } from "../../../core/services/music.service";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div class="flex h-full">
      <app-sidebar></app-sidebar>

      <main
        class="flex-1 bg-gradient-to-b from-spotify-dark to-black overflow-y-auto"
      >
        <div class="p-8">
          <!-- Header -->
          <div class="mb-8">
            <h1 class="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p class="text-spotify-gray">
              Manage your music streaming platform
            </p>
          </div>

          <!-- Tab Navigation -->
          <div class="flex space-x-4 mb-8">
            <button
              *ngFor="let tab of tabs"
              (click)="activeTab = tab"
              [class.bg-spotify-green]="activeTab === tab"
              [class.text-black]="activeTab === tab"
              [class.bg-spotify-black]="activeTab !== tab"
              [class.text-white]="activeTab !== tab"
              class="px-6 py-3 rounded-full font-medium transition-colors"
            >
              {{ tab }}
            </button>
          </div>

          <!-- Songs Management -->
          <div *ngIf="activeTab === 'Songs'">
            <!-- Add Song Form -->
            <div class="bg-spotify-dark p-6 rounded-lg mb-8">
              <h3 class="text-xl font-bold text-white mb-4">Add New Song</h3>
              <form (ngSubmit)="addSong()" #songForm="ngForm">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    [(ngModel)]="newSong.title"
                    name="title"
                    placeholder="Song Title"
                    required
                    class="input-field"
                  />
                  <input
                    type="text"
                    [(ngModel)]="newSong.artist"
                    name="artist"
                    placeholder="Artist"
                    required
                    class="input-field"
                  />
                  <input
                    type="text"
                    [(ngModel)]="newSong.album"
                    name="album"
                    placeholder="Album"
                    required
                    class="input-field"
                  />
                  <input
                    type="number"
                    [(ngModel)]="newSong.duration"
                    name="duration"
                    placeholder="Duration (seconds)"
                    required
                    class="input-field"
                  />
                  <select
                    [(ngModel)]="newSong.genre"
                    name="genre"
                    required
                    class="input-field"
                  >
                    <option value="">Select Genre</option>
                    <option *ngFor="let genre of genres" [value]="genre">
                      {{ genre }}
                    </option>
                  </select>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label class="block text-spotify-gray mb-2"
                      >Audio File</label
                    >
                    <input
                      type="file"
                      (change)="onAudioFileSelected($event)"
                      accept="audio/*"
                      required
                      class="input-field"
                    />
                  </div>
                  <div>
                    <label class="block text-spotify-gray mb-2"
                      >Cover Image (Optional)</label
                    >
                    <input
                      type="file"
                      (change)="onImageFileSelected($event)"
                      accept="image/*"
                      class="input-field"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  [disabled]="!songForm.form.valid"
                  class="btn-primary"
                >
                  Add Song
                </button>
              </form>
            </div>

            <!-- Songs List -->
            <div class="bg-spotify-dark p-6 rounded-lg">
              <h3 class="text-xl font-bold text-white mb-4">All Songs</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-left">
                  <thead>
                    <tr class="border-b border-gray-700">
                      <th class="pb-3 text-spotify-gray">Title</th>
                      <th class="pb-3 text-spotify-gray">Artist</th>
                      <th class="pb-3 text-spotify-gray">Album</th>
                      <th class="pb-3 text-spotify-gray">Genre</th>
                      <th class="pb-3 text-spotify-gray">Plays</th>
                      <th class="pb-3 text-spotify-gray">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      *ngFor="let song of songs"
                      class="border-b border-gray-800"
                    >
                      <td class="py-3 text-white">{{ song.title }}</td>
                      <td class="py-3 text-spotify-gray">{{ song.artist }}</td>
                      <td class="py-3 text-spotify-gray">{{ song.album }}</td>
                      <td class="py-3 text-spotify-gray">{{ song.genre }}</td>
                      <td class="py-3 text-spotify-gray">
                        {{ song.playCount }}
                      </td>
                      <td class="py-3">
                        <button
                          (click)="deleteSong(song._id)"
                          class="text-red-500 hover:text-red-400 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Albums Management -->
          <div *ngIf="activeTab === 'Albums'">
            <!-- Add Album Form -->
            <div class="bg-spotify-dark p-6 rounded-lg mb-8">
              <h3 class="text-xl font-bold text-white mb-4">Add New Album</h3>
              <form (ngSubmit)="addAlbum()" #albumForm="ngForm">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    [(ngModel)]="newAlbum.title"
                    name="title"
                    placeholder="Album Title"
                    required
                    class="input-field"
                  />
                  <input
                    type="text"
                    [(ngModel)]="newAlbum.artist"
                    name="artist"
                    placeholder="Artist"
                    required
                    class="input-field"
                  />
                  <select
                    [(ngModel)]="newAlbum.genre"
                    name="genre"
                    required
                    class="input-field"
                  >
                    <option value="">Select Genre</option>
                    <option *ngFor="let genre of genres" [value]="genre">
                      {{ genre }}
                    </option>
                  </select>
                  <div>
                    <label class="block text-spotify-gray mb-2"
                      >Cover Image</label
                    >
                    <input
                      type="file"
                      (change)="onAlbumImageSelected($event)"
                      accept="image/*"
                      class="input-field"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  [disabled]="!albumForm.form.valid"
                  class="btn-primary"
                >
                  Add Album
                </button>
              </form>
            </div>

            <!-- Albums List -->
            <div class="bg-spotify-dark p-6 rounded-lg">
              <h3 class="text-xl font-bold text-white mb-4">All Albums</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div *ngFor="let album of albums" class="relative group">
                  <img
                    [src]="album.imageUrl || '/assets/default-album.png'"
                    [alt]="album.title"
                    class="w-full aspect-square object-cover rounded-lg mb-2"
                  />
                  <h4 class="text-white font-medium truncate">
                    {{ album.title }}
                  </h4>
                  <p class="text-spotify-gray text-sm truncate">
                    {{ album.artist }}
                  </p>
                  <button
                    (click)="deleteAlbum(album._id)"
                    class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Users Management -->
          <div *ngIf="activeTab === 'Users'">
            <div class="bg-spotify-dark p-6 rounded-lg">
              <h3 class="text-xl font-bold text-white mb-4">All Users</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-left">
                  <thead>
                    <tr class="border-b border-gray-700">
                      <th class="pb-3 text-spotify-gray">Username</th>
                      <th class="pb-3 text-spotify-gray">Email</th>
                      <th class="pb-3 text-spotify-gray">Role</th>
                      <th class="pb-3 text-spotify-gray">Status</th>
                      <th class="pb-3 text-spotify-gray">Joined</th>
                      <th class="pb-3 text-spotify-gray">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      *ngFor="let user of users"
                      class="border-b border-gray-800"
                    >
                      <td class="py-3 text-white">{{ user.username }}</td>
                      <td class="py-3 text-spotify-gray">{{ user.email }}</td>
                      <td class="py-3">
                        <span
                          [class.text-spotify-green]="user.role === 'admin'"
                          [class.text-white]="user.role === 'user'"
                        >
                          {{ user.role }}
                        </span>
                      </td>
                      <td class="py-3">
                        <span
                          [class.text-red-500]="user.isBlocked"
                          [class.text-green-500]="!user.isBlocked"
                        >
                          {{ user.isBlocked ? "Blocked" : "Active" }}
                        </span>
                      </td>
                      <td class="py-3 text-spotify-gray">
                        {{ user.createdAt | date : "short" }}
                      </td>
                      <td class="py-3 space-x-2">
                        <!-- Remove the promote button -->
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  activeTab = "Songs";
  tabs = ["Songs", "Albums", "Users"];

  songs: Song[] = [];
  albums: Album[] = [];
  users: User[] = [];

  genres = [
    "Pop",
    "Rock",
    "Hip-Hop",
    "Electronic",
    "Jazz",
    "Classical",
    "Country",
    "R&B",
    "Other",
  ];

  newSong = {
    title: "",
    artist: "",
    album: "",
    duration: 0,
    genre: "",
  };

  newAlbum = {
    title: "",
    artist: "",
    genre: "",
  };

  selectedAudioFile: File | null = null;
  selectedImageFile: File | null = null;
  selectedAlbumImage: File | null = null;

  constructor(
    private adminService: AdminService,
    private musicService: MusicService
  ) {}

  ngOnInit(): void {
    this.loadSongs();
    this.loadAlbums();
    this.loadUsers();
  }

  private loadSongs(): void {
    this.musicService.getAllSongs(1, 1000).subscribe({
      next: (result) => {
        this.songs = result.songs;
      },
      error: (error) => console.error("Error loading songs:", error),
    });
  }

  private loadAlbums(): void {
    // Note: In a real implementation, you'd have an admin endpoint to get all albums
    console.log("Loading albums...");
  }

  private loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => console.error("Error loading users:", error),
    });
  }

  onAudioFileSelected(event: any): void {
    this.selectedAudioFile = event.target.files[0];
  }

  onImageFileSelected(event: any): void {
    this.selectedImageFile = event.target.files[0];
  }

  onAlbumImageSelected(event: any): void {
    this.selectedAlbumImage = event.target.files[0];
  }

  addSong(): void {
    if (!this.selectedAudioFile) {
      alert("Please select an audio file");
      return;
    }

    console.log("Adding song with data:", this.newSong);
    console.log("Audio file:", this.selectedAudioFile);
    console.log("Image file:", this.selectedImageFile);

    const formData = new FormData();
    formData.append("title", this.newSong.title);
    formData.append("artist", this.newSong.artist);
    formData.append("album", this.newSong.album);
    formData.append("duration", this.newSong.duration.toString());
    formData.append("genre", this.newSong.genre);
    formData.append("audio", this.selectedAudioFile);

    if (this.selectedImageFile) {
      formData.append("image", this.selectedImageFile);
    }

    this.adminService.createSong(formData).subscribe({
      next: (song) => {
        console.log("Song added successfully:", song);
        alert("Song added successfully!");
        this.resetSongForm();
        this.loadSongs();
      },
      error: (error) => {
        console.error("Error adding song:", error);
        alert(`Error adding song: ${error.message}`);
      },
    });
  }

  addAlbum(): void {
    const formData = new FormData();
    formData.append("title", this.newAlbum.title);
    formData.append("artist", this.newAlbum.artist);
    formData.append("genre", this.newAlbum.genre);

    if (this.selectedAlbumImage) {
      formData.append("image", this.selectedAlbumImage);
    }

    this.adminService.createAlbum(formData).subscribe({
      next: (album) => {
        console.log("Album added successfully:", album);
        this.resetAlbumForm();
        this.loadAlbums();
      },
      error: (error) => {
        console.error("Error adding album:", error);
        alert("Error adding album. Please try again.");
      },
    });
  }

  deleteSong(id: string): void {
    if (confirm("Are you sure you want to delete this song?")) {
      this.adminService.deleteSong(id).subscribe({
        next: () => {
          console.log("Song deleted successfully");
          this.loadSongs();
        },
        error: (error) => console.error("Error deleting song:", error),
      });
    }
  }

  deleteAlbum(id: string): void {
    if (confirm("Are you sure you want to delete this album?")) {
      this.adminService.deleteAlbum(id).subscribe({
        next: () => {
          console.log("Album deleted successfully");
          this.loadAlbums();
        },
        error: (error) => console.error("Error deleting album:", error),
      });
    }
  }

  private resetSongForm(): void {
    this.newSong = {
      title: "",
      artist: "",
      album: "",
      duration: 0,
      genre: "",
    };
    this.selectedAudioFile = null;
    this.selectedImageFile = null;
    this.selectedAlbumImage = null;
  }

  private resetAlbumForm(): void {
    this.newAlbum = {
      title: "",
      artist: "",
      genre: "",
    };
    this.selectedAlbumImage = null;
  }
}
