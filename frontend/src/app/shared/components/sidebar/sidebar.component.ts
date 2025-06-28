import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { ThemeToggleComponent } from "../theme-toggle/theme-toggle.component";
import { ThemeService } from "../../../core/services/theme.service";

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent],
  template: `
    <!-- Mobile Hamburger -->
    <button
      class="md:hidden fixed top-4 left-4 z-50 bg-spotify-green text-black p-2 rounded-full shadow-lg"
      (click)="sidebarOpen = true"
    >
      <span class="text-2xl">☰</span>
    </button>
    <!-- Sidebar Drawer for Mobile -->
    <div
      *ngIf="sidebarOpen"
      class="fixed inset-0 z-40 bg-black bg-opacity-60 md:hidden"
      (click)="sidebarOpen = false"
    ></div>
    <div
      [class.hidden]="!sidebarOpen"
      class="fixed top-0 left-0 h-full w-64 bg-spotify-dark p-6 z-50 md:hidden transition-transform duration-300"
      [class.light-mode]="!(themeService.isDarkMode$ | async)"
    >
      <button
        class="absolute top-4 right-4 text-white text-2xl"
        (click)="sidebarOpen = false"
      >
        &times;
      </button>
      <!-- Sidebar content -->
      <ng-container *ngTemplateOutlet="sidebarContent"></ng-container>
    </div>
    <!-- Desktop Sidebar -->
    <div
      class="w-64 theme-bg h-full p-6 border-r border-gray-800 hidden md:block"
      [class.border-gray-200]="!(themeService.isDarkMode$ | async)"
      [class.light-mode]="!(themeService.isDarkMode$ | async)"
    >
      <ng-container *ngTemplateOutlet="sidebarContent"></ng-container>
    </div>
    <ng-template #sidebarContent>
      <!-- Logo -->
      <div class="mb-8">
        <div class="flex items-center space-x-3">
          <img src="/suite.png" alt="Sweat Music Logo" class="h-8 w-auto" />
          <h1 class="text-xl font-bold theme-text">Sweat Music</h1>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="space-y-4">
        <a routerLink="/home" routerLinkActive="active" class="sidebar-item">
          <span class="text-xl">🏠</span>
          <span>Home</span>
        </a>

        <!-- Public Navigation (always visible) -->
        <a routerLink="/search" routerLinkActive="active" class="sidebar-item">
          <span class="text-xl">🔍</span>
          <span>Search</span>
        </a>

        <!-- Authenticated User Navigation -->
        <ng-container *ngIf="isAuthenticated">
          <a
            routerLink="/library"
            routerLinkActive="active"
            class="sidebar-item"
          >
            <span class="text-xl">📚</span>
            <span>Your Library</span>
          </a>

          <div
            class="border-t border-gray-700 pt-4 mt-4"
            [class.border-gray-300]="!(themeService.isDarkMode$ | async)"
          >
            <a
              routerLink="/profile"
              routerLinkActive="active"
              class="sidebar-item"
            >
              <span class="text-xl">👤</span>
              <span>Profile</span>
            </a>
            <a
              *ngIf="isAdmin"
              routerLink="/admin"
              routerLinkActive="active"
              class="sidebar-item"
            >
              <span class="text-xl">⚙️</span>
              <span>Admin Panel</span>
            </a>
            <button
              (click)="logout()"
              class="sidebar-item w-full text-left mt-4"
            >
              <span class="text-xl">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </ng-container>

        <!-- Non-authenticated User Actions -->
        <ng-container *ngIf="!isAuthenticated">
          <div
            class="border-t border-gray-700 pt-4 mt-4"
            [class.border-gray-300]="!(themeService.isDarkMode$ | async)"
          >
            <a routerLink="/login" class="sidebar-item">
              <span class="text-xl">🔑</span>
              <span>Sign In</span>
            </a>
            <a
              routerLink="/register"
              class="sidebar-item bg-spotify-green text-black hover:bg-green-600"
            >
              <span class="text-xl">✨</span>
              <span>Create Account</span>
            </a>
          </div>
        </ng-container>

        <!-- Theme Toggle (always visible) -->
        <div class="mt-4">
          <app-theme-toggle></app-theme-toggle>
        </div>
      </nav>
    </ng-template>
  `,
})
export class SidebarComponent {
  sidebarOpen = false;
  constructor(
    private authService: AuthService,
    public themeService: ThemeService
  ) {}

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  logout(): void {
    this.authService.logout();
    window.location.href = "/home";
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
