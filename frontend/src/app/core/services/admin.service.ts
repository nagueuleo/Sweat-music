import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, catchError, throwError } from "rxjs";
import { Song, Album } from "../models/song.model";
import { User } from "../models/user.model";

@Injectable({
  providedIn: "root",
})
export class AdminService {
  private apiUrl = "http://localhost:3000/api";

  constructor(private http: HttpClient) {}

  // Song management
  createSong(songData: FormData): Observable<Song> {
    console.log("Creating song with data:", songData);
    return this.http
      .post<Song>(`${this.apiUrl}/music/songs`, songData)
      .pipe(catchError(this.handleError));
  }

  updateSong(id: string, songData: Partial<Song>): Observable<Song> {
    console.log("Updating song:", id, songData);
    return this.http
      .put<Song>(`${this.apiUrl}/music/songs/${id}`, songData)
      .pipe(catchError(this.handleError));
  }

  deleteSong(id: string): Observable<void> {
    console.log("Deleting song:", id);
    return this.http
      .delete<void>(`${this.apiUrl}/music/songs/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Album management
  createAlbum(albumData: FormData): Observable<Album> {
    console.log("Creating album with data:", albumData);
    return this.http
      .post<Album>(`${this.apiUrl}/music/albums`, albumData)
      .pipe(catchError(this.handleError));
  }

  updateAlbum(id: string, albumData: Partial<Album>): Observable<Album> {
    console.log("Updating album:", id, albumData);
    return this.http
      .put<Album>(`${this.apiUrl}/music/albums/${id}`, albumData)
      .pipe(catchError(this.handleError));
  }

  deleteAlbum(id: string): Observable<void> {
    console.log("Deleting album:", id);
    return this.http
      .delete<void>(`${this.apiUrl}/music/albums/${id}`)
      .pipe(catchError(this.handleError));
  }

  // User management
  getAllUsers(): Observable<User[]> {
    console.log("Getting all users");
    return this.http
      .get<User[]>(`${this.apiUrl}/users`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error("Admin service error:", error);

    let errorMessage = "An error occurred";

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage =
          "Unable to connect to server. Please check your connection.";
      } else if (error.status === 400) {
        errorMessage = error.error?.message || "Invalid request";
      } else if (error.status === 401) {
        errorMessage = "Unauthorized. Please login again.";
      } else if (error.status === 403) {
        errorMessage =
          error.error?.message || "Access forbidden. Admin rights required.";
      } else if (error.status === 404) {
        errorMessage = "Service not found";
      } else if (error.status >= 500) {
        errorMessage =
          error.error?.message || "Server error. Please try again later.";
      } else {
        errorMessage = error.error?.message || "An unexpected error occurred";
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  // The following admin-only endpoints (block, unblock, promote, stats) are not implemented in the backend.
  // You can implement them in the backend if needed, or remove these methods if not used.
  // blockUser, unblockUser, promoteUser, getStats
}
