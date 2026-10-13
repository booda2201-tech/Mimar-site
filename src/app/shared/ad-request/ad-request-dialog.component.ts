import { Component, ElementRef, HostListener, ViewChild, effect, inject } from '@angular/core';
import { NgClass, NgFor } from '@angular/common';
import { LangService } from '../../core/i18n/lang.service';
import { AdService, AdView } from '../../core/services/ad.service';
import { CreateAdRequestComponent } from './create-ad-request/create-ad-request.component';
import { TrackAdStatusComponent } from './track-ad-status/track-ad-status.component';

@Component({
  selector: 'app-ad-request-dialog',
  standalone: true,
  imports: [NgClass, NgFor, CreateAdRequestComponent, TrackAdStatusComponent],
  template: `
    <div
      class="fixed inset-0 z-[60] flex items-end justify-center transition-all duration-300 ease-in-out sm:items-center sm:p-6"
      [ngClass]="ads.dialogOpen() ? 'visible opacity-100' : 'invisible opacity-0'"
      [attr.aria-hidden]="!ads.dialogOpen()"
    >
      <div class="absolute inset-0 bg-brand-deeper/70 backdrop-blur-sm" (click)="ads.close()"></div>

      <div
        #panel
        role="dialog"
        aria-modal="true"
        aria-labelledby="ad-dialog-title"
        tabindex="-1"
        class="relative flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-[0_-20px_60px_-20px_rgba(4,33,26,0.6)] transition-all duration-300 ease-out focus:outline-none sm:max-h-[90dvh] sm:rounded-3xl sm:shadow-[0_40px_100px_-20px_rgba(4,33,26,0.6)]"
        [ngClass]="ads.dialogOpen() ? 'translate-y-0 sm:scale-100' : 'translate-y-full sm:translate-y-8 sm:scale-95'"
      >
        <!-- الهيدر -->
        <div class="grain relative shrink-0 overflow-hidden bg-gradient-to-br from-brand-primary via-brand-dark to-brand-deeper px-5 pb-4 pt-3 text-white sm:px-8 sm:pb-5 sm:pt-6">
          <div class="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]"></div>
          <div class="animate-aurora absolute -top-24 end-0 h-56 w-56 rounded-full bg-brand-gold/25 blur-[80px]"></div>
          <span aria-hidden="true" class="relative mx-auto mb-3 block h-1.5 w-11 rounded-full bg-white/25 sm:hidden"></span>

          <div class="relative flex items-start gap-3 sm:gap-4">
            <span class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-gold-light to-brand-gold text-brand-dark shadow-gold sm:h-12 sm:w-12">
              <span class="material-symbols-outlined text-[24px]">campaign</span>
            </span>
            <div class="min-w-0 flex-1">
              <h2 id="ad-dialog-title" class="text-lg font-black leading-snug sm:text-xl">{{ t.title }}</h2>
              <p class="mt-0.5 text-[0.8rem] leading-6 text-white/65 sm:text-sm">{{ t.dialogSubtitle }}</p>
            </div>
            <button
              type="button"
              (click)="ads.close()"
              class="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5 text-white/80 transition-all duration-300 hover:rotate-90 hover:border-white/30 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/30 active:scale-90 sm:h-10 sm:w-10"
              [attr.aria-label]="t.close"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div class="relative mt-4 flex gap-1 rounded-2xl border border-white/10 bg-black/20 p-1 backdrop-blur sm:mt-5" role="tablist">
            <button
              *ngFor="let tab of tabs"
              type="button"
              role="tab"
              [attr.aria-selected]="ads.view() === tab.key"
              (click)="ads.view.set(tab.key)"
              class="flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-[0.8rem] font-extrabold transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50 sm:text-sm"
              [ngClass]="ads.view() === tab.key
                ? 'bg-gradient-to-b from-brand-gold-light to-brand-gold text-brand-dark shadow-[0_8px_20px_-8px_rgba(200,162,75,0.8)]'
                : 'text-white/70 hover:bg-white/5 hover:text-white'"
            >
              <span class="material-symbols-outlined text-[18px]">{{ tab.icon }}</span>
              {{ t.tabs[tab.key] }}
            </button>
          </div>
        </div>

        <!-- المحتوى -->
        <div #body class="flex-1 overflow-y-auto overscroll-contain [scrollbar-color:rgba(11,74,58,0.25)_transparent] [scrollbar-width:thin] p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-8" role="tabpanel">
          <app-create-ad-request [hidden]="ads.view() !== 'create'" />
          <app-track-ad-status [hidden]="ads.view() !== 'track'" />
        </div>
      </div>
    </div>
  `,
})
export class AdRequestDialogComponent {
  readonly i18n = inject(LangService);
  readonly ads = inject(AdService);

  @ViewChild('panel') panel?: ElementRef<HTMLElement>;
  @ViewChild('body') body?: ElementRef<HTMLElement>;

  readonly tabs: { key: AdView; icon: string }[] = [
    { key: 'create', icon: 'add_photo_alternate' },
    { key: 'track', icon: 'travel_explore' },
  ];

  private returnFocus: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const open = this.ads.dialogOpen();
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        this.returnFocus = document.activeElement as HTMLElement | null;
        setTimeout(() => this.panel?.nativeElement.focus({ preventScroll: true }), 60);
      } else {
        this.returnFocus?.focus?.({ preventScroll: true });
        this.returnFocus = null;
      }
    });
    effect(() => {
      this.ads.view();
      this.body?.nativeElement.scrollTo({ top: 0 });
    });
  }

  get t() {
    return this.i18n.t().advertise;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    // الـ Escape الأول بيقفل القائمة المنسدلة لو مفتوحة
    if (this.ads.dialogOpen() && !document.querySelector('.select-menu')) this.ads.close();
  }
}
