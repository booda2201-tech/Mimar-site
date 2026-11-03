import { Component, afterNextRender } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdRequestDialogComponent } from './shared/ad-request/ad-request-dialog.component';
import { AppDownloadDialogComponent } from './shared/app-download/app-download-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppDownloadDialogComponent, AdRequestDialogComponent],
  template: `
    <router-outlet />
    <app-download-dialog />
    <app-ad-request-dialog />
  `,
})
export class AppComponent {
  constructor() {
    afterNextRender(() => {
      const splash = document.getElementById('splash');
      if (!splash) return;
      setTimeout(() => {
        splash.classList.add('is-done');
        splash.addEventListener('transitionend', () => splash.remove(), { once: true });
      }, 450);
    });
  }
}
