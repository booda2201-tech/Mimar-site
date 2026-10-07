import { Component, inject } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { LangService } from '../../core/i18n/lang.service';
import { LeadService } from '../../core/lead.service';
import { LeadKind, SITE } from '../../core/site.config';
import { RevealDirective } from '../../shared/reveal.directive';
import { SpotlightDirective } from '../../shared/spotlight.directive';
import { StoreBadgeComponent } from '../../shared/app-download/store-badge.component';

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, RevealDirective, SpotlightDirective, StoreBadgeComponent],
  template: `
    <section id="join" class="py-20 sm:py-28">
      <div class="container-x">
        <div class="mx-auto max-w-2xl text-center" appReveal>
          <span class="eyebrow">
            <span class="material-symbols-outlined text-[16px]">diversity_3</span>
            {{ i18n.t().join.eyebrow }}
          </span>
          <h2 class="section-title">{{ i18n.t().join.title }}</h2>
          <div class="title-ornament" aria-hidden="true"><i></i></div>
          <p class="section-subtitle">{{ i18n.t().join.subtitle }}</p>
        </div>

        <div class="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
          <article
            *ngFor="let p of i18n.t().join.portals; let i = index"
            [appReveal]="i * 100"
            appSpotlight
            class="group relative flex flex-col rounded-3xl p-7 transition-all duration-500 ease-out hover:-translate-y-1.5 sm:p-8"
            [ngClass]="isFeatured(p.key)
              ? 'gold-frame spotlight-dark bg-gradient-to-br from-brand-surface via-brand-primary to-brand-deeper text-white shadow-[0_40px_80px_-25px_rgba(11,74,58,0.7)] lg:-my-4 lg:py-12'
              : 'border border-slate-200/80 bg-white shadow-sm hover:border-brand-gold/40 hover:shadow-[0_30px_60px_-25px_rgba(11,74,58,0.3)]'"
          >
            <span
              *ngIf="isFeatured(p.key)"
              class="absolute -top-3.5 start-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-brand-gold-light to-brand-gold px-4 py-1 text-xs font-black text-brand-dark shadow-gold rtl:translate-x-1/2"
            >
              {{ i18n.t().join.featured }}
            </span>

            <span
              class="grid h-14 w-14 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-105"
              [ngClass]="isFeatured(p.key) ? 'bg-brand-gold text-brand-dark' : 'bg-brand-primary/[0.06] text-brand-primary ring-1 ring-brand-primary/10'"
            >
              <span class="material-symbols-outlined text-[28px]">{{ p.icon }}</span>
            </span>

            <h3 class="mt-6 text-xl font-black" [ngClass]="isFeatured(p.key) ? 'text-white' : 'text-brand-dark'">{{ p.title }}</h3>
            <p class="mt-3 text-sm leading-7" [ngClass]="isFeatured(p.key) ? 'text-white/70' : 'text-slate-500'">{{ p.text }}</p>

            <ul class="mb-8 mt-6 space-y-3">
              <li *ngFor="let perk of p.perks" class="flex items-center gap-2.5 text-sm font-bold">
                <span
                  class="grid h-5 w-5 shrink-0 place-items-center rounded-full"
                  [ngClass]="isFeatured(p.key) ? 'bg-brand-gold/20 text-brand-gold-light' : 'bg-emerald-50 text-emerald-600'"
                >
                  <span class="material-symbols-outlined text-[14px]">check</span>
                </span>
                <span [ngClass]="isFeatured(p.key) ? 'text-white/90' : 'text-slate-700'">{{ perk }}</span>
              </li>
            </ul>

            <button
              type="button"
              class="mt-auto w-full"
              [ngClass]="isFeatured(p.key) ? 'btn-gold' : 'btn-outline'"
              (click)="open(p.key)"
            >
              {{ p.cta }}
              <span class="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">arrow_forward</span>
            </button>
          </article>
        </div>

        <div class="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row" appReveal>
          <span class="inline-flex items-center gap-2 text-sm font-bold text-slate-500">
            <span class="material-symbols-outlined text-[18px] text-brand-gold-dark">{{ hasApps ? 'install_mobile' : 'schedule' }}</span>
            {{ hasApps ? i18n.t().join.appsReady : i18n.t().join.appsSoon }}
          </span>
          <div class="flex flex-wrap justify-center gap-3">
            <app-store-badge store="ios" variant="solid" />
            <app-store-badge store="android" variant="solid" />
          </div>
        </div>
      </div>
    </section>
  `,
})
export class JoinComponent {
  readonly i18n = inject(LangService);
  private leads = inject(LeadService);
  readonly hasApps = !!(SITE.apps.ios || SITE.apps.android);

  isFeatured(key: string): boolean {
    return key === 'merchant';
  }

  open(key: string): void {
    this.leads.openForm(key as LeadKind);
  }
}
