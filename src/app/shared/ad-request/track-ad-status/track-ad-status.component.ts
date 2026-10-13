import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { LangService } from '../../../core/i18n/lang.service';
import { AdService, normalizeCode } from '../../../core/services/ad.service';
import { AD_TRACKING_CODE, AdErrorKind, AdRequest, AdServiceError, AdStatus } from '../../../core/models/ad.model';

const PHONE = /^\+?[\d\s-]{8,16}$/;

function trackingCode(control: AbstractControl): ValidationErrors | null {
  const value = (control.value || '') as string;
  return !value || AD_TRACKING_CODE.test(normalizeCode(value)) ? null : { code: true };
}

type Field = 'code' | 'phone';

interface StatusStyle {
  icon: string;
  badge: string;
  dot: string;
  panel: string;
  iconBox: string;
}

type StatusView = AdStatus | 'expired';

const STATUS_STYLES: Record<StatusView, StatusStyle> = {
  expired: {
    icon: 'event_busy',
    badge: 'bg-slate-100 text-slate-600 ring-slate-200',
    dot: 'bg-slate-400',
    panel: 'border-slate-200 bg-gradient-to-br from-slate-50 to-white',
    iconBox: 'bg-slate-200/70 text-slate-500',
  },
  pending: {
    icon: 'hourglass_top',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    dot: 'bg-amber-400',
    panel: 'border-amber-200/80 bg-gradient-to-br from-amber-50 to-white',
    iconBox: 'bg-amber-100 text-amber-600',
  },
  approved: {
    icon: 'event_available',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dot: 'bg-emerald-500',
    panel: 'border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white',
    iconBox: 'bg-emerald-100 text-emerald-600',
  },
  rejected: {
    icon: 'block',
    badge: 'bg-red-50 text-red-700 ring-red-200',
    dot: 'bg-red-500',
    panel: 'border-red-200/80 bg-gradient-to-br from-red-50 to-white',
    iconBox: 'bg-red-100 text-red-600',
  },
};

@Component({
  selector: 'app-track-ad-status',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, NgSwitch, NgSwitchCase, ReactiveFormsModule],
  templateUrl: './track-ad-status.component.html',
})
export class TrackAdStatusComponent {
  readonly i18n = inject(LangService);
  readonly ads = inject(AdService);
  private fb = inject(FormBuilder);

  readonly form = this.fb.group({
    code: ['', [Validators.required, trackingCode]],
    phone: ['', [Validators.required, Validators.pattern(PHONE)]],
  });

  readonly loading = signal(false);
  readonly error = signal<AdErrorKind | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly ad = signal<AdRequest | null>(null);

  constructor() {
    effect(
      () => {
        const code = this.ads.trackCode();
        if (!code) return;
        untracked(() => {
          if (this.ad()?.trackingCode !== code) this.reset();
          this.form.patchValue({ code });
          this.ads.trackCode.set(null);
        });
      },
      { allowSignalWrites: true },
    );
  }

  get t() {
    return this.i18n.t().advertise;
  }

  statusView(ad: AdRequest): StatusView {
    return this.isExpired(ad) ? 'expired' : ad.status;
  }

  style(ad: AdRequest): StatusStyle {
    return STATUS_STYLES[this.statusView(ad)];
  }

  ctrl(name: Field): FormControl {
    return this.form.get(name) as FormControl;
  }

  showError(name: Field): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  errorText(name: Field): string {
    const c = this.form.get(name);
    if (c?.hasError('required')) return this.t.errors.required;
    if (c?.hasError('code')) return this.t.errors.code;
    if (c?.hasError('pattern')) return this.t.errors.phone;
    return '';
  }

  get canUseLast(): boolean {
    const last = this.ads.lastCode();
    return !!last && normalizeCode(this.ctrl('code').value || '') !== last;
  }

  useLast(): void {
    this.form.patchValue({ code: this.ads.lastCode() });
    document.getElementById('track-phone')?.focus();
  }

  normalize(): void {
    const c = this.ctrl('code');
    if (c.value) c.setValue(normalizeCode(c.value));
  }

  submit(): void {
    this.normalize();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      setTimeout(() => document.querySelector<HTMLElement>('#track-form .is-invalid')?.focus());
      return;
    }
    const { code, phone } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);
    this.errorMessage.set(null);
    this.ads.trackAdStatus(code || '', phone || '').subscribe({
      next: (ad) => {
        this.loading.set(false);
        this.ad.set(ad);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        const kind = err instanceof AdServiceError ? err.kind : 'network';
        this.error.set(kind);
        this.errorMessage.set(
          kind === 'invalid' ? (err as AdServiceError).serverMessage || this.t.errors.code : kind === 'not_found' ? this.t.errors.notFound : this.t.errors.network,
        );
      },
    });
  }

  reset(): void {
    this.ad.set(null);
    this.error.set(null);
    this.errorMessage.set(null);
    this.form.reset();
  }

  resubmit(ad: AdRequest): void {
    this.ads.resubmit(ad);
  }

  formatDate(iso: string | null): string {
    if (!iso) return '';
    const locale = this.i18n.isAr() ? 'ar-KW-u-nu-latn' : 'en-GB';
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
  }

  isExpired(ad: AdRequest): boolean {
    return ad.status === 'approved' && !!ad.activeUntil && new Date(ad.activeUntil).getTime() < Date.now();
  }

  approvedText(ad: AdRequest): string {
    const m = this.t.track.messages;
    if (!ad.activeUntil) return m.approvedNoDates;
    const end = this.formatDate(ad.activeUntil);
    if (this.isExpired(ad)) return m.expired.replace('{end}', end);
    if (!ad.reviewedAt) return m.approvedUntil.replace('{end}', end);
    return m.approved.replace('{start}', this.formatDate(ad.reviewedAt)).replace('{end}', end);
  }

  /** المدة مش راجعة كرقم — بنحسبها من تاريخ الموافقة لآخر يوم عرض */
  durationLabel(ad: AdRequest): string {
    if (!ad.reviewedAt || !ad.activeUntil) return '';
    const n = Math.round((new Date(ad.activeUntil).getTime() - new Date(ad.reviewedAt).getTime()) / 86_400_000);
    if (n < 1) return '';
    const d = this.t.days;
    const text = n === 1 ? d.one : n === 2 ? d.two : n <= 10 ? d.few : d.many;
    return text.replace('{n}', String(n));
  }

  readonly details = computed(() => {
    const ad = this.ad();
    if (!ad) return [];
    return [
      ad.placement ? { label: this.t.fields.placement, value: this.t.placements[ad.placement].label } : null,
      { label: this.t.fields.duration, value: this.durationLabel(ad) },
      { label: this.t.track.submittedOn, value: this.formatDate(ad.createdAt) },
      { label: this.t.fields.merchantName, value: ad.companyName || ad.applicantName },
    ].filter((d): d is { label: string; value: string } => !!d?.value);
  });

  /** 0 = اتقدّم، 1 = في المراجعة، 2 = اتاخد قرار */
  stage(status: AdStatus): number {
    return status === 'pending' ? 1 : 2;
  }
}
