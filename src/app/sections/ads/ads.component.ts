import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { map } from 'rxjs';
import { LangService } from '../../core/i18n/lang.service';
import { Advertisement, CatalogService } from '../../core/catalog.service';
import { AppLinkService } from '../../core/app-link.service';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-ads',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, DatePipe, RevealDirective],
  styles: [
    `
      .track {
        animation: ads-ltr var(--dur, 40s) linear infinite;
      }
      :host-context([dir='rtl']) .track {
        animation-name: ads-rtl;
      }
      .marquee:hover .track,
      .marquee:focus-within .track {
        animation-play-state: paused;
      }
      @keyframes ads-ltr {
        to { transform: translateX(-50%); }
      }
      @keyframes ads-rtl {
        to { transform: translateX(50%); }
      }
      @media (prefers-reduced-motion: reduce) {
        .track { animation: none; }
      }
    `,
  ],
  template: `
    <section *ngIf="ads$ | async as ads" class="relative overflow-hidden border-y border-slate-200/70 bg-white py-12 sm:py-20" [hidden]="!ads.length">
      <div class="container-x text-center" appReveal>
        <span class="eyebrow">
          <span class="material-symbols-outlined text-[16px]">campaign</span>
          {{ i18n.t().ads.eyebrow }}
        </span>
        <h2 class="mt-4 text-[1.45rem] font-black tracking-tight text-brand-dark sm:text-3xl">{{ i18n.t().ads.title }}</h2>
        <div class="title-ornament" aria-hidden="true"><i></i></div>
      </div>

      <div class="marquee relative mt-7 overflow-hidden py-4 [mask-image:linear-gradient(90deg,transparent,black_5%,black_95%,transparent)] sm:mt-10 sm:[mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <div class="track flex w-max gap-3 sm:gap-5" [style.--dur]="duration(ads.length)">
          <article
            *ngFor="let ad of ads; let i = index"
            class="group relative h-[11.5rem] w-[17.5rem] shrink-0 overflow-hidden rounded-[1.4rem] sm:rounded-3xl bg-brand-deeper shadow-[0_20px_40px_-24px_rgba(4,33,26,0.55)] ring-1 ring-black/5 transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_30px_60px_-24px_rgba(4,33,26,0.7)] hover:ring-brand-gold/50 sm:h-[14rem] sm:w-[26rem]"
            [attr.aria-hidden]="i >= half(ads.length) ? 'true' : null"
          >
            <img
              *ngIf="ad.imageUrl && !broken.has(ad.id)"
              [src]="ad.imageUrl"
              [alt]="pick(ad.titleAr, ad.titleEn)"
              loading="lazy"
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              (error)="broken.add(ad.id)"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-brand-deeper via-brand-deeper/60 to-brand-deeper/5"></div>
            <div class="absolute inset-0 bg-gradient-to-l from-brand-deeper/70 to-transparent rtl:bg-gradient-to-r"></div>
            <div aria-hidden="true" class="pointer-events-none absolute inset-y-0 -start-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-1000 ease-out group-hover:start-[150%]"></div>

            <div class="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
              <span
                *ngIf="pick(ad.badgeTextAr, ad.badgeTextEn) as badge"
                class="rounded-full bg-gradient-to-r from-brand-gold-light to-brand-gold px-3 py-1 text-[0.7rem] font-black text-brand-dark shadow-gold"
              >{{ badge }}</span>
              <span *ngIf="ad.endDate" class="ms-auto inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[0.65rem] font-bold text-white/85 backdrop-blur">
                <span class="material-symbols-outlined text-[13px]">schedule</span>
                {{ i18n.t().ads.until }} <span dir="ltr">{{ ad.endDate | date: 'dd/MM' }}</span>
              </span>
            </div>

            <div class="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-start text-white sm:inset-x-5 sm:bottom-5">
              <div class="min-w-0">
                <h3 class="truncate text-lg font-black leading-tight sm:text-xl">{{ pick(ad.titleAr, ad.titleEn) }}</h3>
                <p *ngIf="pick(ad.descriptionAr, ad.descriptionEn) as desc" class="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-white/75 sm:text-[0.8rem]">{{ desc }}</p>
                <button
                  type="button"
                  (click)="app.launch()"
                  class="mt-3 inline-flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-gold-light to-brand-gold px-4 text-xs font-black text-brand-dark shadow-gold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(200,162,75,0.8)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/40 active:scale-95"
                  [attr.tabindex]="i >= half(ads.length) ? -1 : null"
                >
                  {{ pick(ad.buttonTextAr, ad.buttonTextEn) || i18n.t().ads.cta }}
                  <span class="material-symbols-outlined text-[16px] rtl:rotate-180">arrow_forward</span>
                </button>
              </div>

              <div *ngIf="ad.products?.length" class="hidden shrink-0 flex-col items-center gap-1 sm:flex">
                <div class="flex -space-x-2.5 rtl:space-x-reverse">
                  <span
                    *ngFor="let p of ad.products.slice(0, 3)"
                    class="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-white ring-2 ring-brand-deeper"
                  >
                    <img *ngIf="p.mainImageUrl; else pIcon" [src]="p.mainImageUrl" alt="" class="h-full w-full object-cover" loading="lazy" />
                    <ng-template #pIcon><span class="material-symbols-outlined text-[16px] text-brand-primary">inventory_2</span></ng-template>
                  </span>
                </div>
                <span class="text-[0.7rem] font-bold text-white/60">{{ ad.products.length }} {{ i18n.t().ads.products }}</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  `,
})
export class AdsComponent {
  readonly i18n = inject(LangService);
  readonly app = inject(AppLinkService);
  readonly broken = new Set<number>();

  /** بنكرر الليستة لحد ما تملى الشاشة، وبعدين نضاعفها علشان اللوب يبقى سلس */
  readonly ads$ = inject(CatalogService).advertisements$.pipe(
    map((list) => {
      if (!list.length) return [];
      let filled = [...list];
      while (filled.length < 6) filled = [...filled, ...list];
      return [...filled, ...filled];
    }),
  );

  pick(ar: string | null, en: string | null): string {
    return (this.i18n.isAr() ? ar : en || ar) || '';
  }

  half(total: number): number {
    return total / 2;
  }

  duration(total: number): string {
    return `${Math.max(30, (total / 2) * 7)}s`;
  }
}
