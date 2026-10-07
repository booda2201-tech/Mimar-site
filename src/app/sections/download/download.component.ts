import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { LangService } from '../../core/i18n/lang.service';
import { AppLinkService } from '../../core/app-link.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { TiltDirective } from '../../shared/tilt.directive';
import { StoreBadgeComponent } from '../../shared/app-download/store-badge.component';
import { PhoneMockComponent } from '../hero/phone-mock.component';

@Component({
  selector: 'app-download',
  standalone: true,
  imports: [NgFor, NgIf, RevealDirective, TiltDirective, StoreBadgeComponent, PhoneMockComponent],
  template: `
    <section id="download" class="relative py-12 sm:py-28">
      <div class="container-x">
        <div class="grain gold-frame relative isolate overflow-hidden rounded-[2rem] bg-brand-deeper px-5 py-10 text-white sm:rounded-[2.5rem] shadow-[0_50px_100px_-30px_rgba(4,33,26,0.75)] sm:px-12 lg:px-16 lg:py-0" appReveal>
          <div class="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]"></div>
          <div class="animate-aurora absolute -top-32 end-0 -z-10 h-96 w-96 rounded-full bg-brand-gold/25 blur-[120px]"></div>
          <div class="animate-aurora absolute -bottom-40 start-1/4 -z-10 h-96 w-96 rounded-full bg-brand-light/30 blur-[130px] [animation-delay:-8s]"></div>

          <div class="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div class="text-center lg:py-16 lg:text-start">
              <span class="eyebrow-dark">
                <span class="material-symbols-outlined text-[16px]">install_mobile</span>
                {{ t().download.eyebrow }}
              </span>

              <h2 class="mt-5 text-[2rem] font-black leading-[1.2] tracking-tight sm:mt-6 sm:text-4xl lg:text-5xl">
                {{ t().download.titleA }}
                <span class="text-gold-shimmer block pb-1">{{ t().download.titleB }}</span>
              </h2>
              <p class="mx-auto mt-4 max-w-lg text-[0.95rem] leading-7 text-white/70 sm:mt-5 sm:text-base sm:leading-8 lg:mx-0">{{ t().download.subtitle }}</p>

              <ul class="mx-auto mt-6 grid max-w-lg grid-cols-2 gap-2 text-start sm:mt-8 sm:gap-3 lg:mx-0">
                <li *ngFor="let p of t().download.points" class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-xs font-bold leading-5 text-white/85 sm:gap-2.5 sm:border-0 sm:bg-transparent sm:p-0 sm:text-sm">
                  <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-gold/20 text-brand-gold-light ring-1 ring-brand-gold/30">
                    <span class="material-symbols-outlined text-[15px]">check</span>
                  </span>
                  {{ p }}
                </li>
              </ul>

              <div class="mt-7 flex flex-col items-center gap-6 sm:mt-10 sm:flex-row sm:justify-center lg:justify-start">
                <div
                  *ngIf="!app.isMobile && app.hasApps"
                  class="hidden shrink-0 rounded-3xl bg-white p-2.5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)] ring-4 ring-brand-gold/25 transition-transform duration-300 ease-in-out hover:scale-[1.03] sm:block"
                >
                  <img [src]="qrSrc" [alt]="t().app.scan" width="128" height="128" class="h-32 w-32 rounded-xl" loading="lazy" />
                </div>

                <div class="flex w-full flex-col items-center gap-3 sm:w-auto sm:items-start">
                  <p *ngIf="!app.isMobile && app.hasApps" class="hidden items-center gap-1.5 text-sm font-black text-brand-gold-light sm:flex">
                    <span class="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                    {{ t().app.scan }}
                  </p>
                  <div class="grid w-full grid-cols-2 gap-2.5 max-sm:[&_app-store-badge>button]:w-full max-sm:[&_app-store-badge>button]:min-w-0 max-sm:[&_app-store-badge>button]:px-3 sm:flex sm:w-auto sm:flex-wrap sm:justify-center sm:gap-3">
                    <app-store-badge store="ios" />
                    <app-store-badge store="android" />
                  </div>
                  <p class="flex items-center gap-2 text-xs font-bold text-white/50">
                    <span class="rounded-full bg-emerald-400/15 px-2 py-0.5 text-emerald-300 ring-1 ring-emerald-400/25">{{ t().download.free }}</span>
                    {{ t().download.platforms }}
                  </p>
                </div>
              </div>

              <button
                type="button"
                class="btn-gold group mt-8 h-14 w-full px-8 text-base sm:hidden"
                (click)="app.launch()"
              >
                <span class="material-symbols-outlined text-[22px] transition-transform duration-300 group-hover:-translate-y-0.5">download</span>
                {{ app.isMobile && app.hasApps ? t().app.open : t().app.cta }}
              </button>
            </div>

            <div class="relative mx-auto hidden w-full max-w-[19rem] lg:block lg:py-16" aria-hidden="true">
              <div class="relative" [appTilt]="8">
                <div class="absolute inset-8 -z-10 rounded-[3rem] bg-brand-gold/30 blur-3xl"></div>
                <div class="absolute -inset-8 -z-10 rounded-full border border-brand-gold/10"></div>
                <div class="absolute -inset-16 -z-10 rounded-full border border-white/5"></div>

                <div class="animate-float gold-frame relative rounded-[2.75rem] bg-gradient-to-b from-white/15 to-white/5 p-2.5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur">
                  <app-phone-mock />
                </div>

                <div class="absolute -start-28 top-[4.5rem] flex items-center gap-3 rounded-2xl border border-white/60 bg-white/95 p-3 pe-4 text-slate-800 shadow-card-hover backdrop-blur" style="animation: float 6s 1s ease-in-out infinite">
                  <span class="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                    <span class="material-symbols-outlined icon-fill text-[20px]">local_shipping</span>
                  </span>
                  <div>
                    <p class="text-xs font-black">{{ t().download.floatTrack }}</p>
                    <p class="text-[0.65rem] font-bold text-slate-400">{{ t().download.floatTrackSub }}</p>
                  </div>
                </div>

                <div class="absolute -end-24 bottom-40 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/95 p-3 pe-4 text-slate-800 shadow-card-hover backdrop-blur" style="animation: float 6s 2.2s ease-in-out infinite">
                  <span class="grid h-10 w-10 place-items-center rounded-xl bg-brand-gold/15 text-brand-gold-dark">
                    <span class="material-symbols-outlined icon-fill text-[20px]">sell</span>
                  </span>
                  <div>
                    <p class="text-xs font-black">{{ t().download.floatPrice }}</p>
                    <p class="text-[0.65rem] font-bold text-slate-400">{{ t().download.floatPriceSub }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class DownloadComponent {
  readonly i18n = inject(LangService);
  readonly app = inject(AppLinkService);
  readonly t = this.i18n.t;

  readonly qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&margin=0&color=073328&data=${encodeURIComponent(this.app.qrTarget)}`;
}
