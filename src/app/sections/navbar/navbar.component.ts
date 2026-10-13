import { Component, HostListener, inject } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { LangService } from '../../core/i18n/lang.service';
import { LeadService } from '../../core/lead.service';
import { SITE } from '../../core/site.config';
import { AppLinkService } from '../../core/app-link.service';
import { AdService } from '../../core/services/ad.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgFor, NgIf, NgClass],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  readonly i18n = inject(LangService);
  private leads = inject(LeadService);
  private app = inject(AppLinkService);
  private ads = inject(AdService);
  readonly site = SITE;

  scrolled = false;
  menuOpen = false;
  active = '';

  readonly links = [
    { id: 'features', key: 'features' },
    { id: 'how', key: 'how' },
    { id: 'offers', key: 'offers' },
    { id: 'categories', key: 'categories' },
    { id: 'download', key: 'download' },
  ] as const;

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 24;
    const probe = window.scrollY + 140;
    let current = '';
    for (const l of this.links) {
      const el = document.getElementById(l.id);
      if (el && el.offsetTop <= probe) current = l.id;
    }
    this.active = current;
  }

  @HostListener('document:keydown.escape')
  closeMenu(): void {
    this.menuOpen = false;
    document.body.style.overflow = '';
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    document.body.style.overflow = this.menuOpen ? 'hidden' : '';
  }

  get appLabel(): string {
    return this.app.isMobile && this.app.hasApps ? this.i18n.t().app.open : this.i18n.t().app.cta;
  }

  advertise(): void {
    this.closeMenu();
    this.ads.open('create');
  }

  contact(): void {
    this.closeMenu();
    this.leads.openForm('contact');
  }

  getApp(): void {
    this.closeMenu();
    this.app.launch();
  }
}
