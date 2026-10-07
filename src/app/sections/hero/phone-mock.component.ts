import { Component, DestroyRef, inject, signal } from '@angular/core';
import { AsyncPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { map } from 'rxjs';
import { LangService } from '../../core/i18n/lang.service';
import { CatalogService, Category } from '../../core/catalog.service';

/** نسخة مصغّرة من الصفحة الرئيسية للتطبيق — بنفس الألوان والترتيب، والصور من الكتالوج الحقيقي */
@Component({
  selector: 'app-phone-mock',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, AsyncPipe, NgTemplateOutlet],
  template: `
    <div class="flex h-[38rem] flex-col overflow-hidden rounded-[2.25rem] bg-[#F8F6F1] text-brand-dark" *ngIf="{ list: (tiles$ | async) ?? [] } as vm">
      <ng-container *ngTemplateOutlet="screen; context: { $implicit: vm.list }"></ng-container>
    </div>

    <ng-template #screen let-tiles>
      <!-- شريط الحالة -->
      <div class="relative flex h-9 shrink-0 items-center justify-between px-6 pt-1 text-[0.6rem] font-black" dir="ltr">
        <span>1:32</span>
        <span class="absolute start-1/2 top-2 h-[1.15rem] w-[4.5rem] -translate-x-1/2 rounded-full bg-black"></span>
        <span class="flex items-center gap-1">
          <span class="material-symbols-outlined icon-fill text-[12px]">signal_cellular_alt</span>
          <span class="material-symbols-outlined icon-fill text-[12px]">wifi</span>
          <span class="material-symbols-outlined icon-fill text-[13px] rotate-90">battery_5_bar</span>
        </span>
      </div>

      <div class="min-h-0 flex-1 overflow-hidden px-3.5">
        <!-- الترحيب -->
        <div class="flex items-center justify-between pb-3 pt-2">
          <div>
            <p class="text-[0.6rem] font-bold text-slate-500">{{ m.greeting }}</p>
            <p class="text-[0.85rem] font-black leading-tight text-brand-dark">{{ m.user }}</p>
          </div>
          <div class="flex gap-1.5">
            <span class="grid h-8 w-8 place-items-center rounded-full bg-white text-brand-dark shadow-[0_4px_12px_-4px_rgba(4,33,26,0.25)]">
              <span class="material-symbols-outlined text-[16px]">notifications</span>
            </span>
            <span class="grid h-8 w-8 place-items-center rounded-full bg-white text-brand-dark shadow-[0_4px_12px_-4px_rgba(4,33,26,0.25)]">
              <span class="material-symbols-outlined text-[16px]">settings</span>
            </span>
          </div>
        </div>

        <!-- البانر -->
        <div
          class="group/banner relative h-[8.25rem] cursor-grab touch-pan-y select-none overflow-hidden rounded-2xl bg-brand-primary shadow-[0_12px_24px_-12px_rgba(4,33,26,0.5)] active:cursor-grabbing"
          (mouseenter)="paused.set(true)"
          (mouseleave)="paused.set(false); swipeStart = null"
          (pointerdown)="onPointerDown($event)"
          (pointerup)="onPointerUp($event, slides(tiles))"
          (pointercancel)="swipeStart = null"
        >
          <ng-container *ngIf="tiles.length; else bannerFallback">
            <img
              *ngFor="let t of tiles.slice(0, slideCount); let i = index"
              [src]="t.imageUrl"
              alt=""
              draggable="false"
              class="pointer-events-none absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-in-out"
              [ngClass]="index(tiles) === i ? 'scale-100 opacity-100' : 'scale-110 opacity-0'"
            />
          </ng-container>
          <ng-template #bannerFallback>
            <div class="absolute inset-0 bg-gradient-to-br from-brand-surface to-brand-deeper"></div>
          </ng-template>
          <div class="absolute inset-0 bg-gradient-to-t from-brand-deeper/90 via-brand-deeper/40 to-transparent rtl:bg-gradient-to-tl"></div>

          <span class="absolute end-2.5 top-2.5 rounded-full bg-[#F5D98F] px-2 py-0.5 text-[0.55rem] font-black text-brand-dark">{{ m.new }}</span>

          <div class="absolute inset-x-3 bottom-3 text-white">
            <p class="truncate text-[0.95rem] font-black leading-tight">
              {{ tiles.length ? name(tiles[index(tiles)]) : m.fallbackTitle }}
            </p>
            <p class="mt-0.5 truncate text-[0.55rem] font-semibold text-white/80">{{ m.bannerSub }}</p>
            <span class="mt-2 inline-flex items-center gap-1 rounded-lg bg-[#F5D98F] px-2.5 py-1 text-[0.6rem] font-black text-brand-dark shadow-[0_6px_14px_-6px_rgba(245,217,143,0.8)]">
              {{ m.explore }}
              <span class="material-symbols-outlined text-[12px] rtl:rotate-180">arrow_forward</span>
            </span>
          </div>

          <ng-container *ngIf="slides(tiles) > 1">
            <button
              *ngFor="let dir of [-1, 1]"
              type="button"
              tabindex="-1"
              (pointerdown)="$event.stopPropagation()"
              (click)="step(dir, slides(tiles))"
              class="absolute top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-brand-dark opacity-0 shadow-md backdrop-blur transition-all duration-300 ease-in-out hover:scale-110 hover:bg-white active:scale-95 group-hover/banner:opacity-100"
              [ngClass]="dir < 0 ? 'start-2' : 'end-2'"
            >
              <span class="material-symbols-outlined text-[15px] rtl:rotate-180">{{ dir < 0 ? 'chevron_left' : 'chevron_right' }}</span>
            </button>
          </ng-container>
        </div>

        <!-- نقاط البانر -->
        <div class="mt-2 flex justify-center gap-1">
          <button
            *ngFor="let d of dots(tiles); let i = index"
            type="button"
            tabindex="-1"
            (click)="go(i)"
            class="group/dot grid h-3 place-items-center transition-all duration-500 ease-in-out"
            [ngClass]="index(tiles) === i ? 'w-5' : 'w-2'"
          >
            <span
              class="h-1 rounded-full transition-all duration-500 ease-in-out"
              [ngClass]="index(tiles) === i ? 'w-4 bg-brand-dark' : 'w-1 bg-slate-300 group-hover/dot:w-2 group-hover/dot:bg-slate-400'"
            ></span>
          </button>
        </div>

        <!-- تسوق حسب القسم -->
        <p class="mt-3 text-[0.75rem] font-black text-brand-dark">{{ m.shopBy }}</p>
        <div class="-mx-3.5 mt-2 flex gap-2 overflow-hidden px-3.5">
          <ng-container *ngIf="tiles.length; else tileFallback">
            <div *ngFor="let t of tiles" class="relative h-[5.5rem] w-[4.6rem] shrink-0 overflow-hidden rounded-xl bg-brand-primary/10">
              <img [src]="t.imageUrl" alt="" class="h-full w-full object-cover" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
              <span class="absolute inset-x-1.5 bottom-1.5 line-clamp-2 text-[0.55rem] font-black leading-tight text-white">{{ name(t) }}</span>
            </div>
          </ng-container>
          <ng-template #tileFallback>
            <div *ngFor="let c of fallbackTiles" class="relative grid h-[5.5rem] w-[4.6rem] shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-surface to-brand-deeper">
              <span class="material-symbols-outlined text-[26px] text-brand-gold-light/70">{{ c.icon }}</span>
              <span class="absolute inset-x-1.5 bottom-1.5 text-[0.55rem] font-black text-white">{{ i18n.pick(c) }}</span>
            </div>
          </ng-template>
        </div>

        <!-- حاسبة الكميات -->
        <div class="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-primary to-brand-deeper p-3 text-white">
          <div class="absolute -end-8 -top-8 h-20 w-20 rounded-full bg-white/5"></div>
          <span class="inline-block rounded-full bg-[#F5D98F] px-2 py-0.5 text-[0.55rem] font-black text-brand-dark">{{ m.calcBadge }}</span>
          <p class="mt-2 text-[0.85rem] font-black">{{ m.calcTitle }}</p>
          <p class="text-[0.55rem] font-semibold text-white/70">{{ m.calcText }}</p>
          <span class="mt-2 inline-flex items-center gap-1 rounded-lg bg-[#F5D98F] px-2.5 py-1 text-[0.6rem] font-black text-brand-dark">
            {{ m.calcCta }}
            <span class="material-symbols-outlined text-[12px] rtl:rotate-180">arrow_forward</span>
          </span>
        </div>
      </div>

      <!-- شريط التنقل السفلي -->
      <div class="relative shrink-0 bg-white px-2 pb-2.5 pt-2 shadow-[0_-8px_20px_-12px_rgba(4,33,26,0.25)]">
        <div class="grid grid-cols-5 items-end text-center">
          <span class="flex flex-col items-center gap-0.5 text-brand-dark">
            <span class="material-symbols-outlined icon-fill text-[18px]">home</span>
            <span class="text-[0.5rem] font-black">{{ m.nav.home }}</span>
          </span>
          <span class="flex flex-col items-center gap-0.5 text-slate-400">
            <span class="material-symbols-outlined text-[18px]">apps</span>
            <span class="text-[0.5rem] font-bold">{{ m.nav.categories }}</span>
          </span>
          <span class="relative flex flex-col items-center">
            <span class="absolute -top-8 grid h-11 w-11 place-items-center rounded-full bg-[#F5D98F] text-brand-dark shadow-[0_8px_18px_-6px_rgba(169,132,51,0.7)] ring-4 ring-white">
              <span class="material-symbols-outlined icon-fill text-[20px]">handshake</span>
            </span>
            <span class="mt-4 text-[0.5rem] font-black text-brand-gold-dark">{{ m.nav.quote }}</span>
          </span>
          <span class="flex flex-col items-center gap-0.5 text-slate-400">
            <span class="relative">
              <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
              <span class="absolute -end-1.5 -top-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-brand-dark text-[0.45rem] font-black text-white">4</span>
            </span>
            <span class="text-[0.5rem] font-bold">{{ m.nav.cart }}</span>
          </span>
          <span class="flex flex-col items-center gap-0.5 text-slate-400">
            <span class="material-symbols-outlined text-[18px]">dashboard_customize</span>
            <span class="text-[0.5rem] font-bold">{{ m.nav.groups }}</span>
          </span>
        </div>
        <div class="mx-auto mt-2 h-1 w-20 rounded-full bg-slate-300"></div>
      </div>
    </ng-template>
  `,
})
export class PhoneMockComponent {
  readonly i18n = inject(LangService);
  readonly active = signal(0);
  readonly slideCount = 4;

  readonly tiles$ = inject(CatalogService).categories$.pipe(map((list) => list.filter((c) => !!c.imageUrl).slice(0, 6)));

  readonly fallbackTiles = [
    { icon: 'roofing', ar: 'تشطيبات', en: 'Finishes' },
    { icon: 'plumbing', ar: 'أدوات صحية', en: 'Sanitary' },
    { icon: 'electrical_services', ar: 'كهرباء', en: 'Electrical' },
    { icon: 'foundation', ar: 'مواد بناء', en: 'Materials' },
  ];

  get m() {
    return this.i18n.t().hero.mock;
  }

  readonly paused = signal(false);
  swipeStart: number | null = null;
  private timer = 0;

  constructor() {
    this.restart();
    inject(DestroyRef).onDestroy(() => clearInterval(this.timer));
  }

  slides(tiles: Category[]): number {
    return Math.max(1, Math.min(this.slideCount, tiles.length));
  }

  index(tiles: Category[]): number {
    return this.active() % this.slides(tiles);
  }

  go(i: number): void {
    this.active.set(i);
    this.restart();
  }

  step(dir: number, count: number): void {
    this.go((((this.active() % count) + dir) % count + count) % count);
  }

  onPointerDown(e: PointerEvent): void {
    this.swipeStart = e.clientX;
  }

  onPointerUp(e: PointerEvent, count: number): void {
    if (this.swipeStart === null) return;
    const dx = e.clientX - this.swipeStart;
    this.swipeStart = null;
    if (Math.abs(dx) < 30 || count < 2) return;
    // في العربي السحب لليمين يجيب اللي بعده
    const forward = this.i18n.isAr() ? dx > 0 : dx < 0;
    this.step(forward ? 1 : -1, count);
  }

  private restart(): void {
    clearInterval(this.timer);
    this.timer = window.setInterval(() => {
      if (!this.paused()) this.active.update((i) => i + 1);
    }, 3500);
  }

  dots(tiles: Category[]): number[] {
    return Array.from({ length: tiles.length ? this.slides(tiles) : 4 }, (_, i) => i);
  }

  name(c: Category): string {
    return this.i18n.isAr() ? c.nameAr : c.nameEn || c.nameAr;
  }
}
