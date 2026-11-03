import { Component, Input, afterNextRender, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { APP_SUPPORT_EMAIL, SITE } from '../core/site.config';

const FOOTER_LINK =
  'rounded-lg px-3 py-1.5 transition-all duration-300 ease-in-out hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/40';

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Returns false when the section isn't on the current page. */
export function scrollToSection(id: string, animate = true): boolean {
  const target = document.getElementById(id);
  if (!target) return false;
  target.scrollIntoView({ block: 'start', behavior: (animate && !prefersReducedMotion() ? 'smooth' : 'instant') as ScrollBehavior });
  return true;
}

/** Shared English (LTR) layout for the store-facing pages: /privacy and /support. */
@Component({
  selector: 'app-legal-shell',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div dir="ltr" lang="en" class="flex min-h-screen flex-col bg-brand-bg text-left">
      <header class="sticky top-0 z-40 border-b border-white/10 bg-brand-deeper/95 backdrop-blur-xl">
        <div class="container-x flex h-16 items-center justify-between gap-4">
          <a
            routerLink="/"
            class="group flex items-center gap-3 rounded-xl transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/40"
            aria-label="M3mar home"
          >
            <span class="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white p-1 shadow-[0_8px_24px_-6px_rgba(200,162,75,0.45)] ring-1 ring-brand-gold/40 transition-transform duration-300 ease-in-out group-hover:scale-105">
              <img [src]="logo" alt="" class="h-full w-full object-contain" />
            </span>
            <span class="leading-tight">
              <span class="block text-base font-black text-white">M3mar</span>
              <span class="block text-[0.68rem] font-semibold text-white/50">by Al Hendal Group</span>
            </span>
          </a>
          <a routerLink="/" class="btn-ghost-light group h-10 px-4 text-xs sm:text-sm">
            <span class="material-symbols-outlined text-[18px] transition-transform duration-300 ease-in-out group-hover:-translate-x-0.5">arrow_back</span>
            Back to home
          </a>
        </div>
      </header>

      <section class="grain relative isolate overflow-hidden bg-gradient-to-b from-brand-deeper via-brand-dark to-brand-primary pb-24 pt-14 text-white sm:pb-28 sm:pt-20">
        <div aria-hidden="true" class="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-brand-gold/20 blur-[120px]"></div>
        <div aria-hidden="true" class="absolute -bottom-32 left-1/4 -z-10 h-80 w-80 rounded-full bg-brand-light/30 blur-[120px]"></div>
        <div class="container-x">
          <span class="eyebrow-dark">
            <span class="material-symbols-outlined text-[16px]">{{ eyebrowIcon }}</span>
            {{ eyebrow }}
          </span>
          <h1 class="mt-5 text-4xl font-black tracking-tight sm:text-5xl">{{ heading }}</h1>
          <p class="mt-4 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">{{ lead }}</p>
          <ng-content select="[shellMeta]"></ng-content>
        </div>
      </section>

      <div class="flex-1">
        <ng-content></ng-content>
      </div>

      <footer class="border-t border-white/10 bg-brand-deeper text-white/55">
        <div class="container-x flex flex-col items-center justify-between gap-4 py-6 text-xs font-semibold sm:flex-row">
          <p>© {{ year }} Al Hendal Group. All rights reserved.</p>
          <nav aria-label="Footer" class="flex flex-wrap items-center justify-center gap-1">
            <a routerLink="/" [class]="footerLink">Home</a>
            <a routerLink="/privacy" [class]="footerLink">Privacy Policy</a>
            <a routerLink="/support" [class]="footerLink">Support</a>
            <a href="/privacy#delete-account" (click)="openDeletion($event)" [class]="footerLink">Delete account</a>
            <a [href]="'mailto:' + email" [class]="footerLink">{{ email }}</a>
            <button type="button" (click)="toTop()" [class]="footerLink + ' inline-flex items-center gap-1 active:scale-95'">
              <span class="material-symbols-outlined text-[16px]">arrow_upward</span>
              Top
            </button>
          </nav>
        </div>
      </footer>
    </div>
  `,
})
export class LegalShellComponent {
  @Input({ required: true }) heading!: string;
  @Input({ required: true }) lead!: string;
  @Input() eyebrow = '';
  @Input() eyebrowIcon = 'info';

  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly email = APP_SUPPORT_EMAIL;
  readonly logo = SITE.logo;
  readonly year = new Date().getFullYear();
  readonly footerLink = FOOTER_LINK;

  constructor() {
    // Router scroll handling is off app-wide (see app.config), so these pages own their scroll position.
    afterNextRender(() => {
      const fragment = this.route.snapshot.fragment;
      if (!fragment || !scrollToSection(fragment, false)) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    });
  }

  /** The router ignores navigation to the URL it's already on, so same-page jumps scroll directly. */
  openDeletion(event: Event): void {
    event.preventDefault();
    if (scrollToSection('delete-account')) this.syncFragment('delete-account');
    else this.router.navigate(['/privacy'], { fragment: 'delete-account' });
  }

  toTop(): void {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    this.syncFragment(null);
  }

  /** Raw history.replaceState would leave the router's state behind and break later same-page links. */
  syncFragment(fragment: string | null): void {
    this.router.navigate([], { relativeTo: this.route, fragment: fragment ?? undefined, replaceUrl: true });
  }
}
