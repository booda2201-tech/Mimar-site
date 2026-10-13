import { Component, inject } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { LangService } from '../../core/i18n/lang.service';
import { AdService } from '../../core/services/ad.service';
import { AD_PLACEMENT_SPECS, AdPlacement } from '../../core/models/ad.model';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-advertise',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, RevealDirective],
  template: `
    <section id="advertise" class="relative py-14 sm:py-24">
      <div class="container-x">
        <div
          class="gold-frame grain relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-surface via-brand-primary to-brand-deeper text-white shadow-[0_40px_90px_-35px_rgba(4,33,26,0.75)] sm:rounded-[2rem]"
          appReveal
        >
          <div class="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_30%_20%,black_25%,transparent_75%)]"></div>
          <div class="animate-aurora absolute -top-32 end-[-6rem] h-80 w-80 rounded-full bg-brand-gold/20 blur-3xl"></div>
          <div class="animate-aurora absolute -bottom-40 start-[-5rem] h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl [animation-delay:-6s]"></div>

          <div class="relative grid items-center gap-10 p-5 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:p-14">
            <!-- النص والأزرار -->
            <div>
              <span class="eyebrow-dark">
                <span class="material-symbols-outlined text-[16px]">campaign</span>
                {{ t.eyebrow }}
              </span>
              <h2 class="mt-4 text-[1.65rem] font-black leading-[1.35] sm:mt-5 sm:text-[2.2rem] lg:text-[2.6rem]">
                <span class="text-gold-shimmer">{{ t.title }}</span>
              </h2>
              <p class="mt-3 max-w-xl text-[0.95rem] leading-[1.9] text-white/70 sm:mt-4 sm:text-[1.05rem]">{{ t.subtitle }}</p>

              <ul class="mt-6 space-y-2.5">
                <li *ngFor="let perk of t.perks" class="flex items-center gap-2.5 text-sm font-bold text-white/90">
                  <span class="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-gold/20 text-brand-gold-light">
                    <span class="material-symbols-outlined text-[14px]">check</span>
                  </span>
                  {{ perk }}
                </li>
              </ul>

              <div class="mt-8 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  (click)="ads.open('create')"
                  class="group flex items-start gap-3 rounded-2xl bg-gradient-to-br from-brand-gold-light via-brand-gold to-brand-gold-dark p-4 text-start text-brand-dark shadow-gold transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-[0_20px_44px_-12px_rgba(200,162,75,0.75)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/40 active:scale-[0.98]"
                >
                  <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-dark/10 transition-transform duration-300 group-hover:scale-110">
                    <span class="material-symbols-outlined text-[22px]">add_photo_alternate</span>
                  </span>
                  <span class="min-w-0">
                    <span class="flex items-center gap-1 text-[0.95rem] font-black">
                      {{ t.tabs.create }}
                      <span class="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">arrow_forward</span>
                    </span>
                    <span class="mt-1 block text-xs font-bold leading-5 text-brand-dark/70">{{ t.newText }}</span>
                  </span>
                </button>

                <button
                  type="button"
                  (click)="ads.open('track')"
                  class="group flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 text-start backdrop-blur transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-brand-gold/50 hover:bg-white/10 hover:shadow-[0_20px_44px_-20px_rgba(0,0,0,0.6)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/30 active:scale-[0.98]"
                >
                  <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gold/15 text-brand-gold-light transition-transform duration-300 group-hover:scale-110">
                    <span class="material-symbols-outlined text-[22px]">travel_explore</span>
                  </span>
                  <span class="min-w-0">
                    <span class="flex items-center gap-1 text-[0.95rem] font-black">
                      {{ t.tabs.track }}
                      <span class="material-symbols-outlined text-[18px] text-brand-gold-light transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">arrow_forward</span>
                    </span>
                    <span class="mt-1 block text-xs font-semibold leading-5 text-white/60">{{ t.trackText }}</span>
                  </span>
                </button>
              </div>

              <button
                *ngIf="ads.lastCode() as code"
                type="button"
                (click)="ads.showTracking(code); ads.open('track')"
                class="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 py-1.5 pe-3 ps-1.5 text-xs font-bold text-white/80 transition-all duration-300 hover:border-brand-gold/60 hover:bg-brand-gold/15 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/30"
                style="animation: heroIn 0.5s both"
              >
                <span class="grid h-6 w-6 place-items-center rounded-full bg-brand-gold text-brand-dark">
                  <span class="material-symbols-outlined text-[14px]">history</span>
                </span>
                {{ t.lastCode }}:
                <span dir="ltr" class="font-mono font-black tracking-wider text-brand-gold-light">{{ code }}</span>
              </button>
            </div>

            <!-- شاشة التطبيق بأماكن الظهور -->
            <div class="flex flex-col items-center gap-6 sm:flex-row sm:justify-center lg:flex-col xl:flex-row" [appReveal]="150">
              <div class="relative w-[13.5rem] shrink-0 rounded-[2.2rem] border border-white/15 bg-gradient-to-b from-white/15 to-white/5 p-2 shadow-[0_40px_70px_-25px_rgba(0,0,0,0.7)] animate-float">
                <div class="overflow-hidden rounded-[1.75rem] bg-brand-bg p-2.5">
                  <div class="mx-auto mb-2.5 h-1.5 w-14 rounded-full bg-slate-300"></div>
                  <div class="mb-2 flex items-center justify-between">
                    <span class="h-2 w-16 rounded-full bg-slate-300"></span>
                    <span class="h-5 w-5 rounded-full bg-slate-200"></span>
                  </div>
                  <ng-container *ngFor="let p of placements; let i = index">
                    <div
                      class="relative grid cursor-default place-items-center overflow-hidden rounded-xl text-[0.65rem] font-black text-brand-dark transition-all duration-500"
                      [ngClass]="[
                        p === 'top_carousel' ? 'h-24' : p === 'mid_banner' ? 'my-2 h-10' : 'mt-2 h-14',
                        active === p ? 'scale-[1.04] bg-gradient-to-br from-brand-gold-light to-brand-gold shadow-gold ring-2 ring-white' : 'bg-gradient-to-br from-brand-gold-light/70 to-brand-gold/70'
                      ]"
                      (mouseenter)="active = p"
                      (mouseleave)="active = null"
                    >
                      <span class="grid h-6 w-6 place-items-center rounded-full bg-brand-dark text-[0.7rem] text-brand-gold-light">{{ i + 1 }}</span>
                      <span aria-hidden="true" class="pointer-events-none absolute inset-y-0 -start-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent ad-sheen" [style.animation-delay]="i * 0.6 + 's'"></span>
                    </div>
                    <div *ngIf="i < 2" class="mt-2 grid grid-cols-2 gap-1.5">
                      <span class="h-12 rounded-lg bg-white shadow-sm"></span>
                      <span class="h-12 rounded-lg bg-white shadow-sm"></span>
                    </div>
                  </ng-container>
                </div>
              </div>

              <div class="w-full max-w-xs">
                <p class="mb-3 text-xs font-extrabold text-brand-gold-light">{{ t.placementsTitle }}</p>
                <ol class="space-y-2">
                  <li
                    *ngFor="let p of placements; let i = index"
                    (mouseenter)="active = p"
                    (mouseleave)="active = null"
                    class="flex items-center gap-3 rounded-xl border p-2.5 transition-all duration-300 ease-in-out"
                    [ngClass]="active === p ? 'border-brand-gold/50 bg-white/10' : 'border-white/10 bg-white/[0.04]'"
                  >
                    <span class="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-gold text-xs font-black text-brand-dark">{{ i + 1 }}</span>
                    <span class="min-w-0">
                      <span class="block text-[0.8rem] font-extrabold leading-5">{{ t.placements[p].label }}</span>
                      <span dir="ltr" class="block font-mono text-[0.68rem] font-bold text-white/50 rtl:text-end">{{ specs[p].width }}×{{ specs[p].height }} · {{ specs[p].ratio }}</span>
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .ad-sheen {
        animation: adSheen 3.5s ease-in-out infinite;
      }
      @keyframes adSheen {
        0%, 60% { inset-inline-start: -100%; }
        100% { inset-inline-start: 150%; }
      }
    `,
  ],
})
export class AdvertiseComponent {
  readonly i18n = inject(LangService);
  readonly ads = inject(AdService);
  readonly placements = Object.keys(AD_PLACEMENT_SPECS) as AdPlacement[];
  readonly specs = AD_PLACEMENT_SPECS;
  active: AdPlacement | null = null;

  get t() {
    return this.i18n.t().advertise;
  }
}
