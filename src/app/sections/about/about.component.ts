import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { LangService } from '../../core/i18n/lang.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { SITE } from '../../core/site.config';
import { SpotlightDirective } from '../../shared/spotlight.directive';
import { TiltDirective } from '../../shared/tilt.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [NgFor, RevealDirective, SpotlightDirective, TiltDirective],
  template: `
    <section id="about" class="py-20 sm:py-28">
      <div class="container-x grid items-center gap-14 lg:grid-cols-2">
        <div appReveal>
          <span class="eyebrow">
            <span class="material-symbols-outlined text-[16px]">info</span>
            {{ i18n.t().about.eyebrow }}
          </span>
          <h2 class="section-title">{{ i18n.t().about.title }}</h2>
          <p class="section-subtitle">{{ i18n.t().about.body }}</p>

          <ul class="mt-9 space-y-4">
            <li
              *ngFor="let p of i18n.t().about.points; let i = index"
              [appReveal]="120 + i * 90"
              appSpotlight
              class="group flex gap-4 rounded-2xl border border-transparent p-3 transition-all duration-300 ease-in-out hover:border-brand-gold/25 hover:bg-white hover:shadow-card"
            >
              <span class="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-surface to-brand-deeper text-brand-gold-light shadow-brand ring-1 ring-brand-gold/30 transition-all duration-300 group-hover:scale-105 group-hover:ring-brand-gold/70">
                <span class="material-symbols-outlined">{{ p.icon }}</span>
              </span>
              <div>
                <h3 class="font-black text-brand-dark">{{ p.title }}</h3>
                <p class="mt-1 text-sm leading-7 text-slate-500">{{ p.text }}</p>
              </div>
            </li>
          </ul>
        </div>

        <div class="relative" [appReveal]="150">
          <div class="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand-gold/20 via-transparent to-brand-primary/15 blur-2xl"></div>
          <div class="gold-frame grain relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-primary via-brand-dark to-brand-deeper p-8 text-white shadow-[0_40px_80px_-30px_rgba(4,33,26,0.6)] sm:p-10" [appTilt]="4">
            <div class="bg-grid absolute inset-0 opacity-60"></div>
            <div class="animate-aurora absolute -end-20 -top-20 h-64 w-64 rounded-full bg-brand-gold/25 blur-3xl"></div>
            <span aria-hidden="true" class="text-outline pointer-events-none absolute -bottom-6 end-4 select-none text-[6.5rem] font-black leading-none" dir="ltr">MIMAR</span>

            <div class="relative flex items-center gap-4">
              <span class="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl bg-white p-2 shadow-[0_16px_40px_-10px_rgba(200,162,75,0.55)] ring-2 ring-brand-gold/50">
                <img [src]="site.logo" alt="MIMAR" class="h-full w-full object-contain" />
              </span>
              <div>
                <p class="text-2xl font-black">{{ i18n.isAr() ? 'معمار' : 'MIMAR' }}</p>
                <p class="text-sm font-bold text-brand-gold-light">{{ i18n.t().footer.tagline }}</p>
              </div>
            </div>

            <div class="relative mt-10 grid grid-cols-2 gap-3">
              <div *ngFor="let a of audiences" appSpotlight class="spotlight-dark rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-gold/40 hover:bg-white/10">
                <span class="material-symbols-outlined text-brand-gold-light">{{ a.icon }}</span>
                <p class="mt-2 text-sm font-extrabold">{{ i18n.pick(a.label) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class AboutComponent {
  readonly i18n = inject(LangService);
  readonly site = SITE;

  readonly audiences = [
    { icon: 'home', label: { ar: 'أصحاب البيوت', en: 'Homeowners' } },
    { icon: 'engineering', label: { ar: 'المقاولين', en: 'Contractors' } },
    { icon: 'storefront', label: { ar: 'التجار', en: 'Merchants' } },
    { icon: 'factory', label: { ar: 'الموردين والبراندات', en: 'Suppliers & brands' } },
  ];
}
