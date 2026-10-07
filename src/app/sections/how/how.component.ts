import { Component, inject, signal } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { LangService } from '../../core/i18n/lang.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { SpotlightDirective } from '../../shared/spotlight.directive';

type Flow = 'order' | 'quote';

@Component({
  selector: 'app-how',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, RevealDirective, SpotlightDirective],
  template: `
    <section id="how" class="grain relative isolate overflow-hidden bg-brand-deeper py-14 text-white sm:py-28">
      <div class="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]"></div>
      <div class="animate-aurora absolute -bottom-40 end-1/4 -z-10 h-96 w-96 rounded-full bg-brand-light/30 blur-[120px]"></div>
      <div class="animate-aurora absolute -top-32 start-1/4 -z-10 h-72 w-72 rounded-full bg-brand-gold/10 blur-[110px] [animation-delay:-6s]"></div>
      <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent"></div>

      <div class="container-x relative z-[1]">
        <div class="mx-auto max-w-2xl text-center" appReveal>
          <span class="eyebrow-dark">
            <span class="material-symbols-outlined text-[16px]">route</span>
            {{ i18n.t().how.eyebrow }}
          </span>
          <h2 class="mt-4 text-[1.7rem] font-black leading-[1.3] tracking-tight sm:mt-5 sm:text-4xl sm:leading-[1.25] lg:text-[2.75rem]">{{ i18n.t().how.title }}</h2>
          <div class="title-ornament" aria-hidden="true"><i></i></div>

          <div class="mx-auto mt-7 grid w-full max-w-xs grid-cols-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur sm:mt-8 sm:inline-flex sm:w-auto sm:max-w-none" role="tablist">
            <button
              *ngFor="let f of flows"
              type="button"
              role="tab"
              [attr.aria-selected]="flow() === f.key"
              (click)="flow.set(f.key)"
              class="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold active:scale-[0.97] sm:px-5 transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50"
              [ngClass]="flow() === f.key ? 'bg-brand-gold text-brand-dark shadow-gold' : 'text-white/70 hover:bg-white/5 hover:text-white'"
            >
              <span class="material-symbols-outlined text-[18px]">{{ f.icon }}</span>
              {{ i18n.t().how.tabs[f.key] }}
            </button>
          </div>
        </div>

        <ol class="relative mx-auto mt-10 grid max-w-md sm:mt-16 sm:max-w-none sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          <li aria-hidden="true" class="absolute inset-x-[12%] top-8 hidden h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent lg:block"></li>
          <li
            *ngFor="let s of i18n.t().how[flow()]; let i = index; let last = last"
            appSpotlight
            class="spotlight-dark group relative flex gap-4 pb-7 text-start transition-all duration-500 last:pb-0 sm:block sm:rounded-3xl sm:border sm:border-transparent sm:px-4 sm:pb-6 sm:text-center sm:hover:border-white/10 sm:hover:bg-white/[0.03]"
            style="animation: heroIn .5s both"
            [style.animation-delay.ms]="i * 90"
          >
            <span *ngIf="!last" aria-hidden="true" class="absolute -bottom-1 start-[calc(2rem-1px)] top-[4.25rem] w-0.5 rounded-full bg-gradient-to-b from-brand-gold/70 to-brand-gold/15 sm:hidden"></span>
            <div class="relative grid h-16 w-16 shrink-0 place-items-center sm:mx-auto rounded-2xl border border-brand-gold/30 bg-brand-primary text-brand-gold-light shadow-[0_0_0_6px_rgba(4,33,26,1)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-brand-gold group-hover:shadow-[0_0_0_6px_rgba(4,33,26,1),0_14px_30px_-8px_rgba(200,162,75,0.5)]">
              <span class="material-symbols-outlined text-[28px]">{{ s.icon }}</span>
              <span class="absolute -end-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-brand-gold text-xs font-black text-brand-dark">{{ i + 1 }}</span>
            </div>
            <div class="min-w-0 pt-2.5 sm:pt-0">
              <h3 class="text-base font-black sm:mt-5 sm:text-lg">{{ s.title }}</h3>
              <p class="mt-1 text-sm leading-6 text-white/60 sm:mx-auto sm:mt-2 sm:max-w-[15rem] sm:leading-7">{{ s.text }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>
  `,
})
export class HowComponent {
  readonly i18n = inject(LangService);
  readonly flow = signal<Flow>('order');
  readonly flows: { key: Flow; icon: string }[] = [
    { key: 'order', icon: 'shopping_cart' },
    { key: 'quote', icon: 'request_quote' },
  ];
}
