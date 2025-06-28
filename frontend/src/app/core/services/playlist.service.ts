import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Playlist, CreatePlaylistRequest } from '../models/playlist.model';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getUserPlaylists(): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${this.apiUrl}/playlists/user`);
  }

  getPlaylistById(id: string): Observable<Playlist> {
    return this.http.get<Playlist>(`${this.apiUrl}/playlists/${id}`);
  }

  createPlaylist(data: CreatePlaylistRequest | FormData): Observable<Playlist> {
    return this.http.post<Playlist>(`${this.apiUrl}/playlists`, data);
  }

  updatePlaylist(id: string, data: Partial<Playlist> | FormData): Observable<any> {
    if (data instanceof FormData) {
      return this.http.put<any>(`${this.apiUrl}/playlists/${id}`, data);
    } else {
      return this.http.put<any>(`${this.apiUrl}/playlists/${id}`, data);
    }
  }

  deletePlaylist(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/playlists/${id}`);
  }

  addSongToPlaylist(playlistId: string, songId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/playlists/${playlistId}/songs`, { songId });
  }

  removeSongFromPlaylist(playlistId: string, songId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/playlists/${playlistId}/songs/${songId}`);
  }

  followPlaylist(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/playlists/${id}/follow`, {});
  }

  unfollowPlaylist(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/playlists/${id}/follow`);
  }

  getPublicPlaylists(): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${this.apiUrl}/playlists/public`);
  }
}