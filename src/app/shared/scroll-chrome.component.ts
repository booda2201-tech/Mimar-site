import { Component, HostListener, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { LangService } from '../core/i18n/lang.service';

/** شريط تقدّم القراءة في الأعلى + زرار الرجوع لأعلى بحلقة تقدّم */
@Component({
  selector: 'app-scroll-chrome',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="pointer-events-none fixed inset-x-0 top-0 z-[55] h-[2px]">
      <div
        class="h-full origin-left bg-gradient-to-r from-brand-gold-dark via-brand-gold-light to-brand-gold shadow-[0_0_12px_rgba(223,193,123,0.8)] rtl:origin-right"
        [style.transform]="'scaleX(' + progress() + ')'"
      ></div>
    </div>

    <button
      type="button"
      (click)="toTop()"
      [attr.aria-label]="i18n.t().footer.top"
      [title]="i18n.t().footer.top"
      class="group fixed bottom-24 end-4 z-40 sm:bottom-6 sm:end-6 grid h-14 w-14 place-items-center rounded-full bg-brand-deeper/90 text-brand-gold-light shadow-[0_18px_40px_-12px_rgba(4,33,26,0.7)] ring-1 ring-white/10 backdrop-blur-xl transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-brand-primary hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/40 active:scale-95"
      [ngClass]="progress() > 0.08 ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-4 opacity-0'"
    >
      <svg viewBox="0 0 56 56" class="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="28" cy="28" r="26" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
        <circle
          cx="28" cy="28" r="26" fill="none" stroke="url(#chrome-gold)" stroke-width="2" stroke-linecap="round"
          [attr.stroke-dasharray]="circumference"
          [attr.stroke-dashoffset]="circumference * (1 - progress())"
        />
        <defs>
          <linearGradient id="chrome-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#f0d38c" />
            <stop offset="1" stop-color="#a98433" />
          </linearGradient>
        </defs>
      </svg>
      <span class="material-symbols-outlined relative text-[22px] transition-transform duration-300 group-hover:-translate-y-0.5">arrow_upward</span>
    </button>
  `,
})
export class ScrollChromeComponent {
  readonly i18n = inject(LangService);
  readonly progress = signal(0);
  readonly circumference = 2 * Math.PI * 26;

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onScroll(): void {
    const max = document.documentElement.scrollHeight - innerHeight;
    this.progress.set(max > 0 ? Math.min(1, scrollY / max) : 0);
  }

  toTop(): void {
    scrollTo({ top: 0, behavior: 'smooth' });
  }
}
