import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { RegisterRequest } from "../../../core/models/user.model";
import { AvatarSelectorComponent } from "../../../shared/components/avatar-selector/avatar-selector.component";
import { ThemeService } from "../../../core/services/theme.service";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AvatarSelectorComponent],
  template: `
    <div
      class="min-h-screen theme-bg flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style="background-image: url('/musique.jpg');"
    >
      <div
        class="theme-surface p-8 rounded-lg w-full max-w-md shadow-xl bg-opacity-95 backdrop-blur-sm"
      >
        <h1 class="text-3xl font-bold theme-text mb-8 text-center">
          Sign up for Spotify Clone
        </h1>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <!-- Avatar Selection -->
          <app-avatar-selector
            [selectedAvatar]="userData.avatar || ''"
            (avatarSelected)="onAvatarSelected($event)"
            (customAvatarSelected)="onCustomAvatarSelected($event)"
          >
          </app-avatar-selector>

          <div class="mb-6">
            <label class="block theme-muted mb-2">Username</label>
            <input
              type="text"
              [(ngModel)]="userData.username"
              name="username"
              required
              class="input-field w-full"
              [class.light-mode]="!(themeService.isDarkMode$ | async)"
              placeholder="Choose a username"
            />
          </div>

          <div class="mb-6">
            <label class="block theme-muted mb-2">Email</label>
            <input
              type="email"
              [(ngModel)]="userData.email"
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
              [(ngModel)]="userData.password"
              name="password"
              required
              class="input-field w-full"
              [class.light-mode]="!(themeService.isDarkMode$ | async)"
              placeholder="Create a password"
            />
          </div>

          <button
            type="submit"
            [disabled]="!registerForm.form.valid || isLoading"
            class="btn-primary w-full mb-4"
          >
            {{ isLoading ? "Creating account..." : "Sign Up" }}
          </button>
        </form>

        <div *ngIf="error" class="text-red-500 text-sm mb-4 text-center">
          {{ error }}
        </div>

        <div class="text-center">
          <p class="theme-muted">
            Already have an account?
            <a routerLink="/login" class="text-spotify-green hover:underline"
              >Log in</a
            >
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  userData: RegisterRequest = {
    username: "",
    email: "",
    password: "",
    avatar: "custom",
    customAvatar: "",
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

  onAvatarSelected(avatarId: string): void {
    this.userData.avatar = avatarId;
  }

  onCustomAvatarSelected(customAvatarData: string): void {
    this.userData.avatar = "custom";
    this.userData.customAvatar = customAvatarData;
  }

  onSubmit(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.error = "";

    this.authService.register(this.userData).subscribe({
      next: () => {
        this.router.navigate(["/home"]);
      },
      error: (error) => {
        this.error =
          error.error?.message || "Registration failed. Please try again.";
        this.isLoading = false;
      },
    });
  }
}
