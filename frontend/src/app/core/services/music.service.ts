import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Song, Album, PlayHistory } from '../models/song.model';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Songs
  getAllSongs(page = 1, limit = 20): Observable<{ songs: Song[], total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<{ songs: Song[], total: number }>(`${this.apiUrl}/music/songs`, { params });
  }

  getSongById(id: string): Observable<Song> {
    return this.http.get<Song>(`${this.apiUrl}/music/songs/${id}`);
  }

  searchSongs(query: string, genre?: string): Observable<{ songs: Song[], albums: Album[] }> {
    let params = new HttpParams().set('q', query);
    if (genre) {
      params = params.set('genre', genre);
    }
    return this.http.get<{ songs: Song[], albums: Album[] }>(`${this.apiUrl}/music/search`, { params });
  }

  // Albums
  getAllAlbums(): Observable<Album[]> {
    return this.http.get<Album[]>(`${this.apiUrl}/music/albums`);
  }

  getAlbumById(id: string): Observable<Album> {
    return this.http.get<Album>(`${this.apiUrl}/music/albums/${id}`);
  }

  // Likes
  likeSong(songId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/music/songs/${songId}/like`, {});
  }

  unlikeSong(songId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/music/songs/${songId}/like`);
  }

  getLikedSongs(): Observable<Song[]> {
    return this.http.get<Song[]>(`${this.apiUrl}/music/liked-songs`);
  }

  // Play history
  recordPlay(songId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/music/play`, { songId });
  }

  getPlayHistory(): Observable<PlayHistory[]> {
    return this.http.get<PlayHistory[]>(`${this.apiUrl}/music/history`);
  }

  // Recommendations
  getRecommendations(): Observable<Song[]> {
    return this.http.get<Song[]>(`${this.apiUrl}/music/recommendations`);
  }

  // Export
  exportListeningStats(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/music/export-stats`, { responseType: 'blob' });
  }
}