import { Component, HostListener, afterNextRender, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { LangService } from '../../core/i18n/lang.service';
import { AppLinkService } from '../../core/app-link.service';
import { SITE } from '../../core/site.config';

const DISMISS_KEY = 'mimar-sticky-dismissed';
const PROMPT_KEY = 'mimar-app-prompted';
const PROMPT_DELAY_MS = 4000;

/** شريط تحميل ثابت أسفل الشاشة على الموبايل + فتح نافذة التحميل تلقائياً مرة واحدة في الجلسة */
@Component({
  selector: 'app-sticky-download-bar',
  standalone: true,
  imports: [NgClass],
  template: `
    <div
      class="fixed inset-x-3 bottom-3 z-40 transition-all duration-300 ease-in-out sm:hidden"
      [ngClass]="visible() ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-[calc(100%+1rem)] opacity-0'"
      [attr.aria-hidden]="!visible()"
    >
      <div class="gold-frame flex items-center gap-3 rounded-2xl bg-brand-deeper/95 p-2.5 ps-3 text-white shadow-[0_20px_50px_-12px_rgba(4,33,26,0.8)] backdrop-blur-xl">
        <span class="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-1 ring-1 ring-brand-gold/40">
          <img [src]="logo" alt="" class="h-full w-full object-contain" />
        </span>
        <div class="min-w-0 flex-1 leading-tight">
          <p class="truncate text-sm font-black">{{ i18n.t().sticky.title }}</p>
          <p class="truncate text-xs font-semibold text-white/60">{{ i18n.t().sticky.text }}</p>
        </div>
        <button
          type="button"
          class="btn-gold h-10 shrink-0 px-4 text-sm"
          (click)="app.launch()"
        >
          <span class="material-symbols-outlined text-[18px]">download</span>
          {{ i18n.t().sticky.cta }}
        </button>
        <button
          type="button"
          (click)="dismiss()"
          class="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/50 transition-all duration-300 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/40 active:scale-95"
          [attr.aria-label]="i18n.t().sticky.dismiss"
        >
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  `,
})
export class StickyDownloadBarComponent {
  readonly i18n = inject(LangService);
  readonly app = inject(AppLinkService);
  readonly logo = SITE.logo;

  private readonly dismissed = signal(sessionStorage.getItem(DISMISS_KEY) === '1');
  private readonly pastHero = signal(false);

  visible(): boolean {
    return this.pastHero() && !this.dismissed() && !this.app.dialogOpen();
  }

  constructor() {
    afterNextRender(() => {
      if (!this.app.isMobile || !this.app.hasApps || sessionStorage.getItem(PROMPT_KEY)) return;
      setTimeout(() => {
        if (this.app.dialogOpen()) return;
        sessionStorage.setItem(PROMPT_KEY, '1');
        this.app.dialogOpen.set(true);
      }, PROMPT_DELAY_MS);
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.pastHero.set(scrollY > innerHeight * 0.6);
  }

  dismiss(): void {
    sessionStorage.setItem(DISMISS_KEY, '1');
    this.dismissed.set(true);
  }
}
