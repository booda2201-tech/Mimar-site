import { Component, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { map } from 'rxjs';
import { LangService } from '../../core/i18n/lang.service';
import { CatalogService, Category } from '../../core/catalog.service';
import { AppLinkService } from '../../core/app-link.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { SpotlightDirective } from '../../shared/spotlight.directive';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, RevealDirective, SpotlightDirective],
  template: `
    <section *ngIf="categories$ | async as categories" id="categories" class="bg-white py-14 sm:py-28" [hidden]="!categories.length">
      <div class="container-x">
        <div class="mx-auto max-w-2xl text-center" appReveal>
          <span class="eyebrow">
            <span class="material-symbols-outlined text-[16px]">category</span>
            {{ i18n.t().categories.eyebrow }}
          </span>
          <h2 class="section-title">{{ i18n.t().categories.title }}</h2>
          <div class="title-ornament" aria-hidden="true"><i></i></div>
          <p class="section-subtitle">{{ i18n.t().categories.subtitle }}</p>
        </div>

        <div class="mt-8 grid grid-cols-3 gap-2.5 sm:mt-14 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          <article
            *ngFor="let c of categories; let i = index; trackBy: trackById"
            [appReveal]="(i % 3) * 60"
            appSpotlight
            role="button"
            tabindex="0"
            (click)="app.launch()"
            (keydown.enter)="app.launch()"
            class="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-brand-gold/50 hover:shadow-[0_30px_60px_-25px_rgba(11,74,58,0.35)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/30 active:scale-[0.97]"
          >
            <div class="relative aspect-square overflow-hidden bg-gradient-to-br from-brand-primary/5 to-brand-gold/10 sm:aspect-[4/3]">
              <img
                *ngIf="c.imageUrl && !broken.has(c.id); else iconTpl"
                [src]="c.imageUrl"
                [alt]="name(c)"
                loading="lazy"
                class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                (error)="broken.add(c.id)"
              />
              <div aria-hidden="true" class="pointer-events-none absolute inset-y-0 -start-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-1000 ease-out group-hover:start-[150%]"></div>
              <ng-template #iconTpl>
                <div class="grid h-full w-full place-items-center">
                  <span class="material-symbols-outlined text-5xl text-brand-primary/40">{{ iconFor(i) }}</span>
                </div>
              </ng-template>
              <div class="absolute inset-0 hidden bg-gradient-to-t from-brand-deeper/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block"></div>
              <div class="absolute inset-0 bg-gradient-to-t from-brand-deeper/90 via-brand-deeper/20 to-transparent sm:hidden"></div>
              <h3 class="absolute inset-x-2 bottom-2 line-clamp-2 text-[0.72rem] font-black leading-tight text-white drop-shadow sm:hidden">{{ name(c) }}</h3>
            </div>
            <div class="hidden flex-1 items-center justify-between gap-2 p-4 sm:flex">
              <div class="min-w-0">
                <h3 class="truncate font-black text-brand-dark">{{ name(c) }}</h3>
                <p *ngIf="c.children?.length" class="mt-0.5 text-xs font-bold text-slate-400">
                  {{ c.children.length }} {{ i18n.t().categories.sub }}
                </p>
              </div>
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-primary/5 text-brand-primary ring-1 ring-brand-primary/10 transition-all duration-300 group-hover:bg-brand-gold group-hover:text-brand-dark group-hover:shadow-gold group-hover:ring-brand-gold">
                <span class="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_forward</span>
              </span>
            </div>
          </article>
        </div>
      </div>
    </section>
  `,
})
export class CategoriesComponent {
  readonly i18n = inject(LangService);
  readonly app = inject(AppLinkService);
  readonly categories$ = inject(CatalogService).categories$.pipe(map((list) => list.slice(0, 12)));
  readonly broken = new Set<number>();

  private readonly icons = ['foundation', 'construction', 'format_paint', 'grid_view', 'plumbing', 'carpenter', 'electrical_services', 'roofing'];

  name(c: Category): string {
    return this.i18n.isAr() ? c.nameAr : c.nameEn || c.nameAr;
  }

  iconFor(i: number): string {
    return this.icons[i % this.icons.length];
  }

  trackById(_: number, c: Category): number {
    return c.id;
  }
}
