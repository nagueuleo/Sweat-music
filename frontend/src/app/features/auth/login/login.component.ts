import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { LoginRequest } from "../../../core/models/user.model";
import { ThemeService } from "../../../core/services/theme.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div
      class="min-h-screen theme-bg flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style="background-image: url('/musique.jpg');"
    >
      <div
        class="theme-surface p-8 rounded-lg w-full max-w-md shadow-xl bg-opacity-95 backdrop-blur-sm"
      >
        <div class="text-center mb-6">
          <img
            src="/suite.png"
            alt="Sweat Music Logo"
            class="mx-auto mb-4 h-24 w-auto"
          />
        </div>
        <h1 class="text-3xl font-bold theme-text mb-8 text-center">
          Login to Sweat music
        </h1>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="mb-6">
            <label class="block theme-muted mb-2">Email</label>
            <input
              type="email"
              [(ngModel)]="credentials.email"
              name="email"
              required
              class="input-field w-full"
              [class.light-mode]="!(themeService.isDarkMode$ | async)"
              placeholder="Enter your email"
            />
          </div>

          <div class="mb-6">
            <label class="block theme-muted mb-2">Password</label>
            <input
              type="password"
              [(ngModel)]="credentials.password"
              name="password"
              required
              class="input-field w-full"
              [class.light-mode]="!(themeService.isDarkMode$ | async)"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            [disabled]="!loginForm.form.valid || isLoading"
            class="btn-primary w-full mb-4"
          >
            {{ isLoading ? "Logging in..." : "Log In" }}
          </button>
        </form>

        <div *ngIf="error" class="text-red-500 text-sm mb-4 text-center">
          {{ error }}
        </div>

        <div class="text-center">
          <p class="theme-muted">
            Don't have an account?
            <a routerLink="/register" class="text-spotify-green hover:underline"
              >Sign up</a
            >
          </p>
        </div>

        <!-- Demo Credentials -->
        <div
          class="mt-6 p-4 bg-gray-800 rounded-lg"
          [class.bg-gray-100]="!(themeService.isDarkMode$ | async)"
        >
          <h3 class="theme-text font-medium mb-2">Demo Credentials:</h3>
          <p class="theme-muted text-sm">
            Admin: admin&#64;spotify-clone.com / admin123
          </p>
          <p class="theme-muted text-sm">
            User: john&#64;example.com / password123
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  credentials: LoginRequest = {
    email: "",
    password: "",
  };

  isLoading = false;
  error = "";

  constructor(
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(["/home"]);
    }
  }

  onSubmit(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.error = "";

    console.log("Submitting login form with:", this.credentials);

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log("Login successful, navigating to home");
        this.router.navigate(["/home"]);
      },
      error: (error) => {
        console.error("Login error:", error);
        this.error = error.message || "Login failed. Please try again.";
        this.isLoading = false;
      },
    });
  }
}
