import { Component, HostListener, effect, inject, signal } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { LangService } from '../../core/i18n/lang.service';
import { LeadService } from '../../core/lead.service';
import { AppLinkService } from '../../core/app-link.service';
import { SITE } from '../../core/site.config';
import { StoreBadgeComponent } from './store-badge.component';

const CLOSE_DRAG_PX = 110;

@Component({
  selector: 'app-download-dialog',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, StoreBadgeComponent],
  template: `
    <div
      class="fixed inset-0 z-[60] flex items-end justify-center p-0 transition-all duration-300 ease-in-out sm:items-center sm:p-6"
      [ngClass]="app.dialogOpen() ? 'visible opacity-100' : 'invisible opacity-0'"
      [attr.aria-hidden]="!app.dialogOpen()"
    >
      <div
        class="absolute inset-0 bg-brand-deeper/70 backdrop-blur-sm transition-opacity duration-300"
        [style.opacity]="dragY() ? 1 - Math.min(dragY() / 400, 0.6) : null"
        (click)="app.close()"
      ></div>

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-dialog-title"
        class="relative max-h-[92dvh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-t-[1.75rem] bg-white shadow-[0_-20px_60px_-20px_rgba(4,33,26,0.6)] sm:rounded-3xl sm:shadow-[0_40px_100px_-20px_rgba(4,33,26,0.6)]"
        [ngClass]="[
          dragging ? '' : 'transition-all duration-300 ease-out',
          app.dialogOpen() ? 'translate-y-0 sm:scale-100' : 'translate-y-full sm:translate-y-8 sm:scale-95'
        ]"
        [style.transform]="dragY() ? 'translateY(' + dragY() + 'px)' : null"
      >
        <!-- الهيدر (بيتسحب لتحت علشان يقفل على الموبايل) -->
        <div
          class="relative touch-none overflow-hidden bg-brand-deeper px-5 pb-5 pt-3 text-white sm:touch-auto sm:px-8 sm:pb-8 sm:pt-6"
          (pointerdown)="dragStart($event)"
          (pointermove)="dragMove($event)"
          (pointerup)="dragEnd()"
          (pointercancel)="dragEnd()"
        >
          <div class="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]"></div>
          <div class="absolute -top-24 end-0 h-56 w-56 rounded-full bg-brand-gold/25 blur-[80px]"></div>

          <span aria-hidden="true" class="relative mx-auto mb-4 block h-1.5 w-11 rounded-full bg-white/25 sm:hidden"></span>

          <div class="relative flex items-start gap-3 sm:gap-4">
            <span class="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white p-1 shadow-lg ring-1 ring-white/20 sm:h-14 sm:w-14">
              <img [src]="site.logo" alt="" class="h-full w-full object-contain" />
            </span>
            <div class="min-w-0 flex-1">
              <h2 id="app-dialog-title" class="text-lg font-black leading-snug sm:text-2xl">{{ app.hasApps ? i18n.t().app.title : i18n.t().app.soonTitle }}</h2>
              <p class="mt-1 text-[0.8rem] leading-6 text-white/65 sm:text-sm">{{ i18n.t().app.subtitle }}</p>
            </div>
            <button
              type="button"
              (click)="app.close()"
              (pointerdown)="$event.stopPropagation()"
              class="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5 text-white/80 transition-all duration-300 hover:rotate-90 hover:border-white/30 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/30 active:scale-90 sm:h-10 sm:w-10"
              [attr.aria-label]="i18n.t().app.close"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <ul class="no-scrollbar relative -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:mt-6 sm:flex-wrap sm:px-0">
            <li
              *ngFor="let perk of i18n.t().app.perks"
              class="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[0.7rem] font-bold text-white/80 sm:py-1 sm:text-xs"
            >
              <span class="material-symbols-outlined icon-fill text-[15px] text-brand-gold">verified</span>
              {{ perk }}
            </li>
          </ul>
        </div>

        <div class="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-8">
          <div *ngIf="app.hasApps; else soon" class="grid items-center gap-8 sm:grid-cols-[auto_1fr]">
            <div *ngIf="!app.isMobile" class="flex flex-col items-center text-center">
              <div class="rounded-3xl border border-brand-primary/10 bg-white p-3 shadow-card ring-4 ring-brand-gold/10">
                <img [src]="qrSrc" [alt]="i18n.t().app.scan" width="168" height="168" class="h-[168px] w-[168px] rounded-xl" loading="lazy" />
              </div>
              <p class="mt-4 flex items-center gap-1.5 text-sm font-black text-brand-dark">
                <span class="material-symbols-outlined text-[18px] text-brand-gold-dark">qr_code_scanner</span>
                {{ i18n.t().app.scan }}
              </p>
              <p class="mt-1 max-w-[13rem] text-xs font-semibold leading-5 text-slate-400">{{ i18n.t().app.scanHint }}</p>
            </div>

            <div [ngClass]="app.isMobile ? 'sm:col-span-2' : ''">
              <p class="text-sm font-bold text-slate-500">{{ i18n.t().app.or }}</p>
              <div class="mt-4 grid grid-cols-2 gap-2.5 max-sm:[&_app-store-badge>button]:w-full max-sm:[&_app-store-badge>button]:min-w-0 max-sm:[&_app-store-badge>button]:px-3 sm:flex sm:flex-wrap sm:gap-3">
                <app-store-badge store="ios" variant="solid" />
                <app-store-badge store="android" variant="solid" />
              </div>
            </div>
          </div>

          <ng-template #soon>
            <div class="flex items-start gap-3.5 rounded-2xl border border-brand-gold/20 bg-gradient-to-br from-brand-gold/[0.08] to-transparent p-4 sm:items-center sm:gap-4 sm:p-5">
              <span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-gold/15 text-brand-gold-dark ring-1 ring-brand-gold/25 sm:h-14 sm:w-14 sm:rounded-2xl">
                <span class="material-symbols-outlined text-[24px] sm:text-[28px]">rocket_launch</span>
              </span>
              <p class="text-[0.8rem] leading-6 text-slate-600 sm:text-sm sm:leading-7">{{ i18n.t().app.soonText }}</p>
            </div>

            <div class="mt-5 grid grid-cols-2 gap-2.5 [&_app-store-badge>button]:w-full [&_app-store-badge>button]:min-w-0 max-sm:[&_app-store-badge>button]:px-3 sm:mt-6 sm:gap-3">
              <app-store-badge store="ios" variant="solid" />
              <app-store-badge store="android" variant="solid" />
            </div>

            <button type="button" class="btn-gold mt-5 h-[3.25rem] w-full text-[0.95rem] sm:mt-6" (click)="contact()">
              <span class="material-symbols-outlined text-[20px]">support_agent</span>
              {{ i18n.t().app.soonCta }}
            </button>
          </ng-template>
        </div>
      </div>
    </div>
  `,
})
export class AppDownloadDialogComponent {
  readonly i18n = inject(LangService);
  readonly app = inject(AppLinkService);
  private leads = inject(LeadService);
  readonly site = SITE;
  readonly Math = Math;

  readonly qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=336x336&margin=0&color=073328&data=${encodeURIComponent(this.app.qrTarget)}`;

  readonly dragY = signal(0);
  dragging = false;
  private startY: number | null = null;

  constructor() {
    effect(() => {
      document.body.style.overflow = this.app.dialogOpen() ? 'hidden' : '';
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.app.dialogOpen()) this.app.close();
  }

  dragStart(e: PointerEvent): void {
    if (e.pointerType === 'mouse' || innerWidth >= 640) return;
    this.startY = e.clientY;
    this.dragging = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  dragMove(e: PointerEvent): void {
    if (this.startY === null) return;
    this.dragY.set(Math.max(0, e.clientY - this.startY));
  }

  dragEnd(): void {
    if (this.startY === null) return;
    const shouldClose = this.dragY() > CLOSE_DRAG_PX;
    this.startY = null;
    this.dragging = false;
    this.dragY.set(0);
    if (shouldClose) this.app.close();
  }

  contact(): void {
    this.app.close();
    this.leads.openForm('contact');
  }
}
