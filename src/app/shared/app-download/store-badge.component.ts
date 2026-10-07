import { Component, Input, inject } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { LangService } from '../../core/i18n/lang.service';
import { AppLinkService, Store } from '../../core/app-link.service';

@Component({
  selector: 'app-store-badge',
  standalone: true,
  imports: [NgClass, NgIf],
  template: `
    <button
      type="button"
      dir="ltr"
      (click)="app.openStore(store)"
      [attr.aria-label]="(store === 'ios' ? i18n.t().app.downloadOn : i18n.t().app.getItOn) + ' ' + name"
      class="group relative inline-flex h-14 min-w-[10.5rem] items-center gap-3 rounded-2xl px-4 text-start transition-all duration-300 ease-in-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 active:translate-y-0 active:scale-[0.98]"
      [ngClass]="variant === 'glass'
        ? 'border border-white/15 bg-black/30 text-white shadow-sm backdrop-blur hover:border-brand-gold/50 hover:bg-black/45 hover:shadow-[0_14px_34px_-14px_rgba(0,0,0,0.7)] focus-visible:ring-brand-gold/30'
        : 'border border-brand-dark bg-brand-dark text-white shadow-sm hover:bg-brand-primary hover:shadow-card-hover focus-visible:ring-brand-primary/25'"
    >
      <svg *ngIf="store === 'ios'" viewBox="0 0 24 24" class="h-7 w-7 shrink-0 fill-current transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
      </svg>
      <svg *ngIf="store === 'android'" viewBox="0 0 24 24" class="h-6 w-6 shrink-0 fill-current text-brand-gold-light transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
        <path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z" />
      </svg>
      <span class="leading-tight" [attr.dir]="i18n.isAr() ? 'rtl' : 'ltr'">
        <span class="block text-[0.65rem] font-bold text-white/60">{{ store === 'ios' ? i18n.t().app.downloadOn : i18n.t().app.getItOn }}</span>
        <span class="block text-base font-black tracking-tight" dir="ltr">{{ name }}</span>
      </span>
      <span
        *ngIf="!available"
        class="absolute -top-2 end-2 rounded-full bg-gradient-to-r from-brand-gold-light to-brand-gold px-2 py-0.5 text-[0.65rem] font-black text-brand-dark shadow-gold"
      >
        {{ i18n.t().app.soon }}
      </span>
    </button>
  `,
})
export class StoreBadgeComponent {
  readonly i18n = inject(LangService);
  readonly app = inject(AppLinkService);

  @Input({ required: true }) store!: Store;
  @Input() variant: 'glass' | 'solid' = 'glass';

  get name(): string {
    return this.store === 'ios' ? 'App Store' : 'Google Play';
  }

  get available(): boolean {
    return !!this.app.storeUrl(this.store);
  }
}
