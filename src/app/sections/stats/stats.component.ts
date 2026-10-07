import { Component, inject } from '@angular/core';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { LangService } from '../../core/i18n/lang.service';
import { CatalogService, CatalogStats } from '../../core/catalog.service';
import { CountUpDirective } from '../../shared/count-up.directive';
import { RevealDirective } from '../../shared/reveal.directive';
import { SpotlightDirective } from '../../shared/spotlight.directive';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, AsyncPipe, CountUpDirective, RevealDirective, SpotlightDirective],
  template: `
    <section *ngIf="stats$ | async as stats" class="relative z-10 -mt-10 pb-2 sm:-mt-14 sm:pb-6" aria-label="Stats">
      <div class="container-x">
        <dl
          class="gold-frame relative grid grid-cols-2 gap-2 overflow-hidden rounded-3xl bg-white/95 p-2 shadow-[0_30px_70px_-25px_rgba(4,33,26,0.35)] ring-1 ring-brand-primary/5 backdrop-blur-xl sm:gap-0 sm:p-3 lg:grid-cols-4"
          appReveal
        >
          <div aria-hidden="true" class="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold to-transparent"></div>

          <div
            *ngFor="let item of items; let i = index"
            appSpotlight
            class="group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-bg to-white p-3.5 text-start ring-1 ring-brand-primary/[0.06] transition-all duration-300 ease-in-out hover:bg-brand-gold/[0.06] active:scale-[0.98] sm:flex-row sm:items-center sm:justify-center sm:gap-4 sm:bg-none sm:px-5 sm:py-7 sm:ring-0 sm:active:scale-100"
          >
            <span aria-hidden="true" class="absolute -end-6 -top-6 h-16 w-16 rounded-full bg-brand-gold/10 blur-xl sm:hidden"></span>
            <span
              *ngIf="item.vLine"
              aria-hidden="true"
              class="absolute inset-y-6 start-0 w-px bg-gradient-to-b from-transparent via-brand-primary/15 to-transparent"
              [ngClass]="item.vLine"
            ></span>
            <span
              *ngIf="item.hLine"
              aria-hidden="true"
              class="absolute inset-x-6 top-0 hidden h-px bg-gradient-to-r from-transparent via-brand-primary/15 to-transparent sm:block lg:hidden"
            ></span>

            <span
              class="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl sm:h-14 sm:w-14 sm:rounded-2xl bg-gradient-to-br from-brand-gold/25 to-brand-gold/5 text-brand-gold-dark ring-1 ring-brand-gold/30 transition-all duration-300 ease-in-out group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:from-brand-surface group-hover:to-brand-deeper group-hover:text-brand-gold-light group-hover:shadow-gold sm:h-14 sm:w-14"
            >
              <span class="material-symbols-outlined text-[19px] sm:text-[26px]">{{ item.icon }}</span>
            </span>

            <div class="relative flex w-full min-w-0 flex-col items-start sm:w-auto">
              <dd class="flex items-start text-[1.75rem] font-black leading-none tracking-tight text-brand-dark sm:text-[2.35rem]" dir="ltr">
                <span [appCountUp]="stats[item.key]"></span><span class="text-gold-gradient ms-0.5 text-[1.1rem] leading-none sm:text-[1.5rem]">+</span>
              </dd>
              <dt class="mt-1.5 w-full truncate text-xs font-bold sm:mt-2 text-slate-500 transition-colors duration-300 group-hover:text-brand-primary sm:w-auto sm:text-sm">
                {{ i18n.t().stats[item.key] }}
              </dt>
            </div>
          </div>
        </dl>
      </div>
    </section>
  `,
})
export class StatsComponent {
  readonly i18n = inject(LangService);
  readonly stats$ = inject(CatalogService).stats$;

  readonly items: { key: keyof CatalogStats; icon: string; vLine: string; hLine: boolean }[] = [
    { key: 'products', icon: 'inventory_2', vLine: '', hLine: false },
    { key: 'users', icon: 'group', vLine: 'hidden sm:block', hLine: false },
    { key: 'categories', icon: 'category', vLine: 'hidden lg:block', hLine: true },
    { key: 'offers', icon: 'local_offer', vLine: 'hidden sm:block', hLine: true },
  ];
}
