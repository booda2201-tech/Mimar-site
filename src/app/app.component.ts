import { Component, afterNextRender } from '@angular/core';
import { NavbarComponent } from './sections/navbar/navbar.component';
import { HeroComponent } from './sections/hero/hero.component';
import { StatsComponent } from './sections/stats/stats.component';
import { CategoriesComponent } from './sections/categories/categories.component';
import { FeaturesComponent } from './sections/features/features.component';
import { HowComponent } from './sections/how/how.component';
import { AdsComponent } from './sections/ads/ads.component';
import { OffersComponent } from './sections/offers/offers.component';
import { DownloadComponent } from './sections/download/download.component';
import { ContactComponent } from './sections/contact/contact.component';
import { FaqComponent } from './sections/faq/faq.component';
import { FooterComponent } from './sections/footer/footer.component';
import { AppDownloadDialogComponent } from './shared/app-download/app-download-dialog.component';
import { StickyDownloadBarComponent } from './shared/app-download/sticky-download-bar.component';
import { ScrollChromeComponent } from './shared/scroll-chrome.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroComponent,
    StatsComponent,
    CategoriesComponent,
    FeaturesComponent,
    HowComponent,
    AdsComponent,
    OffersComponent,
    DownloadComponent,
    ContactComponent,
    FaqComponent,
    FooterComponent,
    AppDownloadDialogComponent,
    StickyDownloadBarComponent,
    ScrollChromeComponent,
  ],
  template: `
    <app-navbar />
    <main>
      <app-hero />
      <app-stats />
      <app-features />
      <app-how />
      <app-ads />
      <app-offers />
      <app-categories />
      <app-download />
      <app-faq />
      <app-contact />
    </main>
    <app-footer />
    <app-download-dialog />
    <app-sticky-download-bar />
    <app-scroll-chrome />
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
