import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Song, Album } from '../models/song.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Song management
  createSong(songData: FormData): Observable<Song> {
    return this.http.post<Song>(`${this.apiUrl}/music/songs`, songData);
  }

  updateSong(id: string, songData: Partial<Song>): Observable<Song> {
    return this.http.put<Song>(`${this.apiUrl}/music/songs/${id}`, songData);
  }

  deleteSong(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/music/songs/${id}`);
  }

  // Album management
  createAlbum(albumData: FormData): Observable<Album> {
    return this.http.post<Album>(`${this.apiUrl}/music/albums`, albumData);
  }

  updateAlbum(id: string, albumData: Partial<Album>): Observable<Album> {
    return this.http.put<Album>(`${this.apiUrl}/music/albums/${id}`, albumData);
  }

  deleteAlbum(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/music/albums/${id}`);
  }

  // User management
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  // The following admin-only endpoints (block, unblock, promote, stats) are not implemented in the backend.
  // You can implement them in the backend if needed, or remove these methods if not used.
  // blockUser, unblockUser, promoteUser, getStats
}