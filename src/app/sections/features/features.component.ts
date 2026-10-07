import { Component, inject } from '@angular/core';
import { NgClass, NgFor } from '@angular/common';
import { LangService } from '../../core/i18n/lang.service';
import { AppLinkService } from '../../core/app-link.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { SpotlightDirective } from '../../shared/spotlight.directive';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [NgFor, NgClass, RevealDirective, SpotlightDirective],
  template: `
    <section id="features" class="relative overflow-hidden py-14 sm:py-28">
      <div class="absolute start-0 top-1/3 -z-10 h-96 w-96 rounded-full bg-brand-gold/10 blur-[120px]"></div>
      <div class="container-x">
        <div class="mx-auto max-w-2xl text-center" appReveal>
          <span class="eyebrow">
            <span class="material-symbols-outlined text-[16px]">auto_awesome</span>
            {{ i18n.t().features.eyebrow }}
          </span>
          <h2 class="section-title">{{ i18n.t().features.title }}</h2>
          <div class="title-ornament" aria-hidden="true"><i></i></div>
        </div>

        <div class="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-5 lg:grid-cols-3">
          <article
            *ngFor="let f of i18n.t().features.items; let i = index; let last = last"
            [appReveal]="(i % 3) * 90"
            appSpotlight
            class="group relative overflow-hidden rounded-2xl border p-4 transition-all duration-500 ease-out hover:-translate-y-1.5 active:scale-[0.98] sm:col-span-1 sm:rounded-3xl sm:border-slate-200/80 sm:bg-white sm:bg-none sm:p-8 sm:text-brand-dark sm:shadow-sm sm:hover:border-brand-gold/40 sm:hover:shadow-[0_30px_60px_-25px_rgba(11,74,58,0.3)]"
            [ngClass]="i === 0
              ? 'col-span-2 border-transparent bg-gradient-to-br from-brand-surface via-brand-primary to-brand-deeper text-white shadow-[0_24px_50px_-24px_rgba(4,33,26,0.7)]'
              : (last ? 'col-span-2 border-brand-gold/25 bg-gradient-to-br from-brand-gold/[0.12] to-white shadow-sm' : 'border-slate-200/80 bg-white shadow-sm')"
          >
            <span aria-hidden="true" class="absolute inset-x-8 top-0 hidden h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-brand-gold to-transparent transition-transform duration-500 group-hover:scale-x-100 sm:block"></span>
            <span aria-hidden="true" class="absolute end-6 top-5 hidden select-none text-5xl font-black leading-none text-brand-primary/[0.05] transition-colors duration-500 group-hover:text-brand-gold/20 sm:block">{{ (i + 1).toString().padStart(2, '0') }}</span>

            <div class="relative flex flex-col gap-3 sm:block" [ngClass]="i === 0 || last ? 'max-sm:flex-row max-sm:items-center max-sm:gap-4' : ''">
              <span
                class="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 transition-all duration-500 sm:h-14 sm:w-14 sm:rounded-2xl sm:bg-brand-primary/[0.06] sm:text-brand-primary sm:ring-brand-primary/10 sm:group-hover:bg-gradient-to-br sm:group-hover:from-brand-surface sm:group-hover:to-brand-deeper sm:group-hover:text-brand-gold-light sm:group-hover:shadow-brand sm:group-hover:ring-brand-gold/40"
                [ngClass]="i === 0 ? 'bg-brand-gold text-brand-dark ring-brand-gold-light/60 max-sm:h-14 max-sm:w-14' : 'bg-brand-primary/[0.06] text-brand-primary ring-brand-primary/10'"
              >
                <span class="material-symbols-outlined text-[24px] sm:text-[28px]">{{ f.icon }}</span>
              </span>
              <div class="min-w-0">
                <h3 class="text-[0.95rem] font-black leading-snug sm:mt-6 sm:text-lg sm:text-brand-dark" [ngClass]="i === 0 ? 'text-white max-sm:text-lg' : 'text-brand-dark'">{{ f.title }}</h3>
                <p
                  class="mt-1 text-xs leading-6 sm:mt-2 sm:line-clamp-none sm:text-sm sm:leading-7 sm:text-slate-500"
                  [ngClass]="[i === 0 ? 'text-white/70' : 'text-slate-500', i === 0 || last ? '' : 'line-clamp-3']"
                >{{ f.text }}</p>
              </div>
            </div>
          </article>
        </div>

        <div class="mt-8 flex justify-center sm:mt-12" appReveal>
          <button type="button" class="btn-gold group h-14 w-full px-8 text-base shadow-[0_18px_40px_-14px_rgba(200,162,75,0.6)] sm:w-auto" (click)="app.launch()">
            <span class="material-symbols-outlined text-[22px] transition-transform duration-300 group-hover:-translate-y-0.5">download</span>
            {{ i18n.t().hero.primary }}
          </button>
        </div>
      </div>
    </section>
  `,
})
export class FeaturesComponent {
  readonly i18n = inject(LangService);
  readonly app = inject(AppLinkService);
}
