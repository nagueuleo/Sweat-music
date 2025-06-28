import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      (click)="toggleTheme()"
      class="flex items-center space-x-2 theme-muted hover:theme-text transition-colors duration-200 p-2 rounded-lg hover:bg-gray-800"
      [title]="(themeService.isDarkMode$ | async) ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
    >
      <span class="text-xl">
        {{ (themeService.isDarkMode$ | async) ? '☀️' : '🌙' }}
      </span>
      <span class="hidden md:inline">
        {{ (themeService.isDarkMode$ | async) ? 'Light' : 'Dark' }}
      </span>
    </button>
  `
})
export class ThemeToggleComponent {
  constructor(public themeService: ThemeService) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}