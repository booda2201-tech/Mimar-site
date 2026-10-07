import { Component, inject } from '@angular/core';
import { AsyncPipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { map } from 'rxjs';
import { LangService } from '../../core/i18n/lang.service';
import { CatalogService, Product } from '../../core/catalog.service';
import { AppLinkService } from '../../core/app-link.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { SpotlightDirective } from '../../shared/spotlight.directive';
import { RailDirective } from '../../shared/rail.directive';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, DecimalPipe, RevealDirective, SpotlightDirective, RailDirective],
  template: `
    <section *ngIf="offers$ | async as offers" id="offers" class="py-14 sm:py-28" [hidden]="!offers.length">
      <div class="container-x">
        <div class="flex items-end justify-between gap-4 text-start" appReveal>
          <div class="min-w-0 max-w-xl">
            <span class="eyebrow">
              <span class="material-symbols-outlined text-[16px]">local_offer</span>
              {{ i18n.t().offers.eyebrow }}
            </span>
            <h2 class="section-title">{{ i18n.t().offers.title }}</h2>
            <p class="section-subtitle !mt-2 sm:!mt-3">{{ i18n.t().offers.subtitle }}</p>
          </div>
          <button type="button" class="btn-primary group hidden shrink-0 sm:inline-flex" (click)="app.launch()">
            <span class="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:-translate-y-0.5">download</span>
            {{ i18n.t().offers.cta }}
          </button>
        </div>

        <div #rail="appRail" appRail class="rail mt-7 grid grid-cols-2 gap-4 sm:mt-12 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          <article
            *ngFor="let p of offers; let i = index; trackBy: trackById"
            [appReveal]="(i % 4) * 80"
            appSpotlight
            role="button"
            tabindex="0"
            (click)="app.launch()"
            (keydown.enter)="app.launch()"
            class="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm max-sm:w-[46%] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-brand-gold/50 hover:shadow-[0_30px_60px_-25px_rgba(11,74,58,0.35)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/30 active:scale-[0.99]"
          >
            <div class="relative aspect-[4/3] overflow-hidden bg-brand-bg">
              <img
                *ngIf="p.mainImageUrl && !broken.has(p.id); else noImg"
                [src]="p.mainImageUrl"
                [alt]="name(p)"
                loading="lazy"
                class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                (error)="broken.add(p.id)"
              />
              <div aria-hidden="true" class="pointer-events-none absolute inset-y-0 -start-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-1000 ease-out group-hover:start-[150%]"></div>
              <ng-template #noImg>
                <div class="grid h-full w-full place-items-center">
                  <span class="material-symbols-outlined text-5xl text-slate-300">inventory_2</span>
                </div>
              </ng-template>
              <span class="absolute start-3 top-3 rounded-full bg-gradient-to-r from-brand-gold-light via-brand-gold to-brand-gold-dark px-3 py-1 text-xs font-black text-brand-dark shadow-gold ring-1 ring-white/50">
                <span dir="ltr">-{{ percent(p) }}%</span>
              </span>
              <span aria-hidden="true" class="absolute bottom-2.5 end-2.5 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-brand-primary shadow-[0_8px_20px_-6px_rgba(4,33,26,0.45)] ring-1 ring-black/5 backdrop-blur transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:bg-brand-gold group-hover:text-brand-dark group-active:scale-95">
                <span class="material-symbols-outlined text-[18px]">add_shopping_cart</span>
              </span>
            </div>

            <div class="flex flex-1 flex-col p-3 sm:p-4">
              <p *ngIf="p.brand" class="truncate text-[0.65rem] font-extrabold uppercase tracking-wide text-brand-gold-dark sm:text-[0.7rem]">{{ i18n.isAr() ? p.brand.nameAr : p.brand.nameEn || p.brand.nameAr }}</p>
              <h3 class="mt-1 line-clamp-2 min-h-[2.5rem] text-[0.8rem] font-black leading-snug text-brand-dark sm:min-h-[2.75rem] sm:text-sm">{{ name(p) }}</h3>
              <div class="mt-auto flex flex-wrap items-baseline gap-x-2 border-t border-dashed border-slate-200 pt-2.5 sm:pt-3">
                <span class="text-base font-black text-brand-primary sm:text-lg">
                  {{ p.finalPrice | number: '1.3-3' }}
                  <span class="text-xs font-bold">{{ i18n.t().offers.currency }}</span>
                </span>
                <span class="text-xs font-bold text-slate-400 line-through">{{ p.price | number: '1.3-3' }}</span>
              </div>
            </div>
          </article>
        </div>

        <div class="rail-progress" aria-hidden="true"><span [style.width.%]="rail.progress()"></span></div>

        <button type="button" class="btn-primary group mt-6 w-full sm:hidden" (click)="app.launch()">
          <span class="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:-translate-y-0.5">download</span>
          {{ i18n.t().offers.cta }}
        </button>
      </div>
    </section>
  `,
})
export class OffersComponent {
  readonly i18n = inject(LangService);
  readonly app = inject(AppLinkService);
  /** الـ variants بترجع كمنتجات منفصلة بنفس الاسم — بنعرض واحد بس من كل منتج */
  readonly offers$ = inject(CatalogService).offers$.pipe(
    map((list) => list.filter((p, i) => list.findIndex((o) => o.nameAr === p.nameAr) === i).slice(0, 8)),
  );
  readonly broken = new Set<number>();

  name(p: Product): string {
    return this.i18n.isAr() ? p.nameAr : p.nameEn || p.nameAr;
  }

  percent(p: Product): number {
    return Math.round((1 - p.finalPrice / p.price) * 100);
  }

  trackById(_: number, p: Product): number {
    return p.id;
  }
}
