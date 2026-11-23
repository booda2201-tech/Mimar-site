import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, HostListener, NgZone, afterNextRender, inject } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { CatalogService } from '../../core/catalog.service';
import { LangService } from '../../core/i18n/lang.service';
import { LeadService } from '../../core/lead.service';
import { SITE } from '../../core/site.config';
import { AppLinkService } from '../../core/app-link.service';
import { AdService } from '../../core/services/ad.service';

const NAV_LINKS = [
  { id: 'features', key: 'features' as const },
  { id: 'how', key: 'how' as const },
  { id: 'offers', key: 'offers' as const },
  { id: 'categories', key: 'categories' as const },
  { id: 'download', key: 'download' as const },
];

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, AsyncPipe],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  readonly i18n = inject(LangService);
  private leads = inject(LeadService);
  private app = inject(AppLinkService);
  private ads = inject(AdService);
  private catalog = inject(CatalogService);
  private zone = inject(NgZone);
  readonly site = SITE;

  scrolled = false;
  menuOpen = false;
  active = '';

  /** العروض والفئات بتيجي من الـ API — اللينك بيختفي لو القسم فاضي أو السيرفر وقع */
  readonly links$ = combineLatest([this.catalog.hasOffers$, this.catalog.hasCategories$]).pipe(
    map(([hasOffers, hasCategories]) =>
      NAV_LINKS.filter((l) => (l.id === 'offers' ? hasOffers : l.id === 'categories' ? hasCategories : true)),
    ),
  );

  private raf = 0;

  constructor() {
    afterNextRender(() => this.updateActive());
    inject(DestroyRef).onDestroy(() => {
      if (this.raf) cancelAnimationFrame(this.raf);
    });
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onScroll(): void {
    this.scheduleUpdate();
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

  /** بعد الضغط على لينك القسم، نحدّث الـ active فوراً قبل ما السكرول يخلّص */
  goTo(event: Event, id: string): void {
    const el = document.getElementById(id);
    if (!el || el.hidden || !el.getClientRects().length) {
      event.preventDefault();
      return;
    }
    this.active = id;
    this.closeMenu();
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

  private scheduleUpdate(): void {
    if (this.raf) return;
    this.zone.runOutsideAngular(() => {
      this.raf = requestAnimationFrame(() => {
        this.raf = 0;
        this.zone.run(() => this.updateActive());
      });
    });
  }

  private updateActive(): void {
    const scrolled = window.scrollY > 24;
    if (scrolled !== this.scrolled) this.scrolled = scrolled;

    // خط القياس تحت الهيدر الثابت — القسم اللي عدّاه هو اللي يبقى active
    const probe = Math.max(96, (document.querySelector('app-navbar header')?.getBoundingClientRect().bottom ?? 72) + 8);
    let current = '';
    const visible: string[] = [];

    for (const link of NAV_LINKS) {
      const el = document.getElementById(link.id);
      if (!el || el.hidden || el.getClientRects().length === 0) continue;
      visible.push(link.id);
      if (el.getBoundingClientRect().top <= probe) current = link.id;
    }

    // في آخر الصفحة ثبّت آخر قسم ظاهر، حتى لو عنوانه لسه فوق خط القياس
    const doc = document.documentElement;
    if (visible.length && window.scrollY + window.innerHeight >= doc.scrollHeight - 48) {
      current = visible[visible.length - 1];
    }

    if (current !== this.active) this.active = current;
  }
}
