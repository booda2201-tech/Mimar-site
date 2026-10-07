import { Component, ElementRef, HostListener, ViewChild, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { LangService } from '../../core/i18n/lang.service';
import { LeadService } from '../../core/lead.service';
import { LeadKind, SITE } from '../../core/site.config';
import { AppLinkService } from '../../core/app-link.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <footer class="grain relative isolate overflow-hidden bg-brand-deeper text-white">
      <div class="h-px bg-gradient-to-r from-transparent via-brand-gold-light to-transparent"></div>
      <div class="animate-aurora absolute -top-40 start-1/3 -z-10 h-96 w-96 rounded-full bg-brand-light/20 blur-[130px]"></div>
      <div
        #word
        aria-hidden="true"
        class="spotlight-word pointer-events-none absolute inset-x-0 bottom-10 -z-10 select-none text-center text-[22vw] font-black leading-none lg:text-[16rem]"
        [class.is-lit]="lit()"
        dir="ltr"
      >
        <span class="spotlight-word__base text-outline block">MIMAR</span>
        <span class="spotlight-word__rim">MIMAR</span>
        <span class="spotlight-word__glow">MIMAR</span>
      </div>

      <div class="container-x relative z-[1] pt-10 sm:pt-14">
        <div class="gold-frame flex flex-col items-center justify-between gap-5 rounded-3xl bg-white/[0.04] p-5 text-center backdrop-blur sm:gap-6 sm:p-9 lg:flex-row lg:text-start">
          <div>
            <h2 class="text-xl font-black leading-snug tracking-tight sm:text-3xl">{{ i18n.t().footer.ctaTitle }}</h2>
            <p class="mt-2 text-sm leading-7 text-white/60 sm:text-base">{{ i18n.t().footer.ctaText }}</p>
          </div>
          <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button type="button" class="btn-gold group px-7" (click)="app.launch()">
              <span class="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:-translate-y-0.5">download</span>
              {{ i18n.t().app.cta }}
            </button>
            <button type="button" class="btn-ghost-light" (click)="open('contact')">
              <span class="material-symbols-outlined text-[18px] text-brand-gold-light">support_agent</span>
              {{ i18n.t().nav.cta }}
            </button>
          </div>
        </div>
      </div>

      <div class="container-x relative z-[1] grid grid-cols-2 gap-x-6 gap-y-9 py-10 sm:gap-10 sm:py-14 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div class="col-span-2 sm:col-span-1">
          <a href="#top" class="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/40">
            <span class="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-white p-1.5 shadow-[0_10px_30px_-8px_rgba(200,162,75,0.5)] ring-1 ring-brand-gold/40">
              <img [src]="site.logo" alt="MIMAR" class="h-full w-full object-contain" />
            </span>
            <span class="text-2xl font-black">{{ i18n.isAr() ? 'معمار' : 'MIMAR' }}</span>
          </a>
          <p class="mt-5 max-w-xs text-sm leading-7 text-white/60">{{ i18n.t().footer.tagline }}</p>
          <div *ngIf="socials.length" class="mt-6 flex gap-2">
            <a
              *ngFor="let s of socials"
              [href]="s.url"
              target="_blank"
              rel="noopener"
              [attr.aria-label]="s.label"
              class="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-xs font-black uppercase text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-gold/50 hover:text-brand-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/40"
            >
              {{ s.short }}
            </a>
          </div>
        </div>

        <nav>
          <h3 class="footer-heading text-sm font-black text-brand-gold-light">{{ i18n.t().footer.links }}</h3>
          <ul class="mt-5 space-y-3">
            <li *ngFor="let l of links">
              <a [href]="'#' + l" class="group inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition-all duration-300 hover:text-white focus-visible:outline-none focus-visible:text-brand-gold-light">
                <span class="h-px w-0 bg-brand-gold transition-all duration-300 group-hover:w-4"></span>
                {{ $any(i18n.t().nav)[l] }}
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <h3 class="text-sm font-black text-brand-gold-light">{{ i18n.t().footer.join }}</h3>
          <ul class="mt-5 space-y-3">
            <li *ngFor="let p of i18n.t().join.portals">
              <button type="button" (click)="open(p.key)" class="group inline-flex items-center gap-2 text-start text-sm font-semibold text-white/60 transition-all duration-300 hover:text-white focus-visible:outline-none focus-visible:text-brand-gold-light">
                <span class="h-px w-0 bg-brand-gold transition-all duration-300 group-hover:w-4"></span>
                {{ p.title }}
              </button>
            </li>
          </ul>
        </div>

        <div class="col-span-2 sm:col-span-1">
          <h3 class="text-sm font-black text-brand-gold-light">{{ i18n.t().footer.contact }}</h3>
          <ul class="mt-5 space-y-3 text-sm font-semibold text-white/60">
            <li class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-brand-gold/80">call</span>
              <a [href]="telHref" dir="ltr" class="transition-colors hover:text-white">{{ site.contact.phone }}</a>
            </li>
            <li class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-brand-gold/80">mail</span>
              <a [href]="'mailto:' + site.contact.email" class="transition-colors hover:text-white">{{ site.contact.email }}</a>
            </li>
            <li class="flex items-start gap-2">
              <span class="material-symbols-outlined text-[18px] text-brand-gold/80">location_on</span>
              <span class="leading-6">{{ i18n.pick(site.contact.address) }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="relative z-[1] border-t border-white/10">
        <div class="container-x flex flex-col items-center justify-between gap-3 pb-24 pt-5 text-xs font-semibold text-white/45 sm:flex-row sm:py-5">
          <p>© {{ year }} {{ i18n.isAr() ? 'معمار' : 'MIMAR' }} — {{ i18n.t().footer.rights }}</p>
          <div class="flex items-center gap-4">
            <span>{{ i18n.t().footer.cr }}: <span dir="ltr">{{ site.commercialRegistration }}</span></span>
            <a href="#top" class="inline-flex items-center gap-1 rounded-lg px-2 py-1 transition-all duration-200 hover:bg-white/5 hover:text-white">
              <span class="material-symbols-outlined text-[16px]">arrow_upward</span>
              {{ i18n.t().footer.top }}
            </a>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly i18n = inject(LangService);
  private leads = inject(LeadService);
  readonly app = inject(AppLinkService);
  readonly site = SITE;
  readonly year = new Date().getFullYear();
  readonly telHref = `tel:${SITE.contact.phone.replace(/\s/g, '')}`;
  readonly links = ['features', 'how', 'offers', 'categories', 'download', 'contact'];

  readonly socials = (
    [
      { key: 'instagram', label: 'Instagram', short: 'IG' },
      { key: 'x', label: 'X', short: 'X' },
      { key: 'tiktok', label: 'TikTok', short: 'TT' },
      { key: 'snapchat', label: 'Snapchat', short: 'SC' },
      { key: 'linkedin', label: 'LinkedIn', short: 'in' },
    ] as const
  )
    .map((s) => ({ ...s, url: SITE.social[s.key] }))
    .filter((s) => !!s.url);

  open(key: string): void {
    this.leads.openForm(key as LeadKind);
  }

  @ViewChild('word', { static: true }) private word!: ElementRef<HTMLElement>;
  readonly lit = signal(false);
  private target = { x: 0, y: 0 };
  private pos = { x: 0, y: 0 };
  private raf = 0;

  /** الكلمة ورا المحتوى فمش بتستقبل hover — بنتابع الماوس على الفوتر كله ونشوف هو جوه حدود الحروف ولا لأ */
  @HostListener('pointermove', ['$event'])
  onPointerMove(e: PointerEvent): void {
    if (e.pointerType !== 'mouse') return;
    const el = this.word.nativeElement;
    const range = document.createRange();
    range.selectNodeContents(el.firstElementChild!);
    const text = range.getBoundingClientRect();
    const inside = e.clientX >= text.left && e.clientX <= text.right && e.clientY >= text.top && e.clientY <= text.bottom;

    const box = el.getBoundingClientRect();
    this.target = { x: e.clientX - box.left, y: e.clientY - box.top };
    if (inside && !this.lit()) this.pos = { ...this.target };
    this.lit.set(inside);
    if (inside) this.animate();
  }

  @HostListener('pointerleave')
  onPointerLeave(): void {
    this.lit.set(false);
  }

  private animate(): void {
    if (this.raf) return;
    const el = this.word.nativeElement;
    const tick = () => {
      this.pos.x += (this.target.x - this.pos.x) * 0.14;
      this.pos.y += (this.target.y - this.pos.y) * 0.14;
      el.style.setProperty('--x', `${this.pos.x.toFixed(1)}px`);
      el.style.setProperty('--y', `${this.pos.y.toFixed(1)}px`);
      const settled = Math.abs(this.target.x - this.pos.x) < 0.5 && Math.abs(this.target.y - this.pos.y) < 0.5;
      this.raf = settled ? 0 : requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }
}
