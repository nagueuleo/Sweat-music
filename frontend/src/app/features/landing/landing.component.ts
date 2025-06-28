import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ThemeService } from "../../core/services/theme.service";

@Component({
  selector: "app-landing",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div
      class="min-h-screen theme-bg bg-cover bg-center bg-no-repeat"
      style="background-image: url('/musique.jpg');"
    >
      <!-- Navigation -->
      <nav class="p-6">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <img src="/suite.png" alt="Sweat Music Logo" class="h-12 w-auto" />
            <span class="text-2xl font-bold theme-text">Sweat Music</span>
          </div>
          <div class="flex items-center space-x-4">
            <button
              (click)="themeService.toggleTheme()"
              class="p-2 rounded-lg theme-surface hover:bg-opacity-80 transition-colors"
            >
              <span class="theme-text">🌙</span>
            </button>
            <a
              routerLink="/login"
              class="px-6 py-2 bg-spotify-green text-white rounded-full hover:bg-green-600 transition-colors font-medium"
            >
              Se connecter
            </a>
            <a
              routerLink="/register"
              class="px-6 py-2 border-2 border-spotify-green text-spotify-green rounded-full hover:bg-spotify-green hover:text-white transition-colors font-medium"
            >
              S'inscrire
            </a>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <div class="max-w-7xl mx-auto px-6 py-20">
        <div class="text-center">
          <h1 class="text-6xl font-bold theme-text mb-6">
            Découvrez la musique
            <span class="text-spotify-green">autrement</span>
          </h1>
          <p class="text-xl theme-muted mb-8 max-w-2xl mx-auto">
            Écoutez des millions de chansons, créez vos playlists personnalisées
            et partagez votre passion musicale avec le monde.
          </p>
          <div class="flex justify-center space-x-4">
            <a
              routerLink="/register"
              class="px-8 py-4 bg-spotify-green text-white rounded-full hover:bg-green-600 transition-colors font-medium text-lg"
            >
              Commencer gratuitement
            </a>
            <a
              routerLink="/login"
              class="px-8 py-4 border-2 border-white text-white rounded-full hover:bg-white hover:text-black transition-colors font-medium text-lg"
            >
              Se connecter
            </a>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="max-w-7xl mx-auto px-6 py-20">
        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center p-6 theme-surface rounded-lg">
            <div class="text-4xl mb-4">🎵</div>
            <h3 class="text-xl font-bold theme-text mb-2">
              Millions de chansons
            </h3>
            <p class="theme-muted">
              Accédez à une vaste bibliothèque musicale avec des artistes du
              monde entier.
            </p>
          </div>
          <div class="text-center p-6 theme-surface rounded-lg">
            <div class="text-4xl mb-4">📱</div>
            <h3 class="text-xl font-bold theme-text mb-2">Écoutez partout</h3>
            <p class="theme-muted">
              Votre musique vous suit sur tous vos appareils, où que vous soyez.
            </p>
          </div>
          <div class="text-center p-6 theme-surface rounded-lg">
            <div class="text-4xl mb-4">🎧</div>
            <h3 class="text-xl font-bold theme-text mb-2">Qualité premium</h3>
            <p class="theme-muted">
              Profitez d'une qualité audio exceptionnelle pour une expérience
              immersive.
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="border-t border-gray-700 mt-20">
        <div class="max-w-7xl mx-auto px-6 py-8">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-4">
              <img src="/suite.png" alt="Sweat Music Logo" class="h-8 w-auto" />
              <span class="theme-text"
                >© 2024 Sweat Music. Tous droits réservés.</span
              >
            </div>
            <div class="flex space-x-6">
              <a href="#" class="theme-muted hover:theme-text transition-colors"
                >À propos</a
              >
              <a href="#" class="theme-muted hover:theme-text transition-colors"
                >Contact</a
              >
              <a href="#" class="theme-muted hover:theme-text transition-colors"
                >Confidentialité</a
              >
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class LandingComponent {
  constructor(public themeService: ThemeService) {}
}
