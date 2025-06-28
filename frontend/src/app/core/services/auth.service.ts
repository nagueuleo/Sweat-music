import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { BehaviorSubject, Observable, tap, catchError, throwError } from "rxjs";
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "../models/user.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = "http://localhost:3000/api";
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      try {
        this.currentUserSubject.next(JSON.parse(user));
        console.log("User loaded from storage:", this.currentUserSubject.value);
      } catch (error) {
        console.error("Error parsing user from storage:", error);
        this.logout();
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log("Attempting login with:", credentials.email);
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          console.log("Login successful:", response);
          localStorage.setItem("token", response.token);
          localStorage.setItem("user", JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }),
        catchError(this.handleError)
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    console.log("Attempting registration with:", userData.email);
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        tap((response) => {
          console.log("Registration successful:", response);
          localStorage.setItem("token", response.token);
          localStorage.setItem("user", JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    console.log("Logging out user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem("token");
    const isAuth = !!token;
    console.log("Authentication check:", isAuth);
    return isAuth;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    const isAdmin = user?.role === "admin";
    console.log("Admin check:", isAdmin);
    return isAdmin;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  updateCurrentUser(user: User): void {
    localStorage.setItem("user", JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // Get current user profile with fresh data
  getCurrentUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`).pipe(
      tap((user) => {
        console.log("Current user profile loaded:", user);
        this.updateCurrentUser(user);
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error("Auth service error:", error);

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
        errorMessage = error.error?.message || "Access forbidden";
      } else if (error.status === 404) {
        errorMessage = "Service not found";
      } else if (error.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else {
        errorMessage = error.error?.message || "An unexpected error occurred";
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
