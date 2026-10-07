import { Component, inject, signal } from '@angular/core';
import { NgClass, NgFor } from '@angular/common';
import { LangService } from '../../core/i18n/lang.service';
import { LeadService } from '../../core/lead.service';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [NgFor, NgClass, RevealDirective],
  template: `
    <section id="faq" class="bg-white py-14 sm:py-28">
      <div class="container-x grid gap-8 sm:gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div appReveal>
          <span class="eyebrow">
            <span class="material-symbols-outlined text-[16px]">help</span>
            {{ i18n.t().faq.eyebrow }}
          </span>
          <h2 class="section-title">{{ i18n.t().faq.title }}</h2>
          <div class="mt-5 flex items-center gap-2" aria-hidden="true">
            <span class="h-1.5 w-1.5 rotate-45 bg-brand-gold"></span>
            <span class="h-px w-20 bg-gradient-to-r from-brand-gold/70 to-transparent rtl:bg-gradient-to-l"></span>
          </div>
          <p class="section-subtitle">{{ i18n.t().faq.subtitle }}</p>
          <button type="button" class="btn-primary mt-8 hidden lg:inline-flex" (click)="leads.openForm('contact')">
            <span class="material-symbols-outlined text-[18px]">support_agent</span>
            {{ i18n.t().nav.cta }}
          </button>
        </div>

        <div class="space-y-2.5 sm:space-y-3" [appReveal]="100">
          <div
            *ngFor="let item of i18n.t().faq.items; let i = index"
            class="overflow-hidden rounded-2xl border transition-all duration-300 ease-in-out"
            [ngClass]="open() === i ? 'border-brand-gold/40 bg-gradient-to-b from-brand-gold/[0.06] to-white shadow-[0_20px_40px_-25px_rgba(169,132,51,0.5)]' : 'border-slate-200/80 bg-white hover:border-brand-gold/30 hover:shadow-sm'"
          >
            <h3>
              <button
                type="button"
                class="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-start text-[0.9rem] font-extrabold leading-6 text-brand-dark active:bg-brand-primary/[0.03] sm:gap-4 sm:text-base transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary/30 sm:px-6 sm:py-5"
                [attr.aria-expanded]="open() === i"
                [attr.aria-controls]="'faq-' + i"
                (click)="toggle(i)"
              >
                {{ item.q }}
                <span
                  class="grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-all duration-300"
                  [ngClass]="open() === i ? 'rotate-45 bg-gradient-to-br from-brand-gold-light to-brand-gold-dark text-brand-dark shadow-gold' : 'bg-brand-primary/5 text-brand-primary'"
                >
                  <span class="material-symbols-outlined text-[20px]">add</span>
                </span>
              </button>
            </h3>
            <div
              [id]="'faq-' + i"
              class="grid transition-all duration-300 ease-in-out"
              [ngClass]="open() === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
            >
              <div class="overflow-hidden">
                <p class="px-4 pb-4 text-sm leading-7 text-slate-500 sm:px-6 sm:pb-5">{{ item.a }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class FaqComponent {
  readonly i18n = inject(LangService);
  readonly leads = inject(LeadService);
  readonly open = signal<number | null>(0);

  toggle(i: number): void {
    this.open.update((cur) => (cur === i ? null : i));
  }
}
