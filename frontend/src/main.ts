import { Component, isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { routes } from './app/app.routes';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { NowPlayingComponent } from './app/shared/components/now-playing/now-playing.component';
import { ThemeService } from './app/core/services/theme.service';
import { CommonModule } from '@angular/common';
import { provideServiceWorker } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NowPlayingComponent],
  template: `
    <div class="h-screen theme-bg theme-text overflow-hidden" [class.light-mode]="!(themeService.isDarkMode$ | async)">
      <div class="h-full pb-24">
        <router-outlet></router-outlet>
      </div>
      <app-now-playing class="fixed bottom-0 left-0 right-0 z-50"></app-now-playing>
    </div>
  `,
})
export class App {
  constructor(public themeService: ThemeService) {
    // Initialize theme service
  }
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          })
  ]
});