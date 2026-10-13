import { Component, ElementRef, OnDestroy, effect, inject, signal, untracked } from '@angular/core';
import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LangService } from '../../../core/i18n/lang.service';
import { AdService, compactPhone } from '../../../core/services/ad.service';
import {
  AD_ADVERTISER_TYPES,
  AD_PLACEMENT_SPECS,
  AdPlacement,
  AdRequest,
  AdServiceError,
  AdSubmitResult,
  AdvertiserType,
} from '../../../core/models/ad.model';

const PHONE = /^\+?[\d\s-]{8,16}$/;
/** الـ https:// اختياري — بيتضاف تلقائياً قبل الإرسال */
const LINK = /^(https?:\/\/)?[^\s/$.?#]+\.[^\s]{2,}$/i;
const TITLE_MAX = 60;
const SUMMARY_MAX = 300;
const MAX_BYTES = 2 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
/** فرق مسموح بيه في نسبة العرض للطول قبل ما نحذّر من القص */
const RATIO_TOLERANCE = 0.06;

type ErrorKey = 'required' | 'phone' | 'email' | 'maxlength' | 'summaryMax' | 'url';
type Field =
  | 'advertiserType'
  | 'applicantName'
  | 'companyName'
  | 'phoneNumber'
  | 'email'
  | 'companySummary'
  | 'facebookUrl'
  | 'instagramUrl'
  | 'websiteUrl'
  | 'adTitle'
  | 'placement';

export type LinkField = 'facebookUrl' | 'instagramUrl' | 'websiteUrl';

@Component({
  selector: 'app-create-ad-request',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, NgTemplateOutlet, ReactiveFormsModule],
  templateUrl: './create-ad-request.component.html',
})
export class CreateAdRequestComponent implements OnDestroy {
  readonly i18n = inject(LangService);
  readonly ads = inject(AdService);
  private fb = inject(FormBuilder);
  private host = inject(ElementRef<HTMLElement>);

  readonly placements = Object.keys(AD_PLACEMENT_SPECS) as AdPlacement[];
  readonly specs = AD_PLACEMENT_SPECS;
  readonly advertiserTypes = AD_ADVERTISER_TYPES;
  readonly titleMax = TITLE_MAX;
  readonly summaryMax = SUMMARY_MAX;
  readonly links: { name: LinkField; icon: string }[] = [
    { name: 'facebookUrl', icon: 'thumb_up' },
    { name: 'instagramUrl', icon: 'photo_camera' },
    { name: 'websiteUrl', icon: 'language' },
  ];

  readonly form = this.fb.group({
    advertiserType: ['individual' as AdvertiserType, Validators.required],
    applicantName: ['', [Validators.required, Validators.maxLength(80)]],
    companyName: ['', Validators.maxLength(120)],
    phoneNumber: ['', [Validators.required, Validators.pattern(PHONE)]],
    email: ['', Validators.email],
    companySummary: ['', Validators.maxLength(SUMMARY_MAX)],
    facebookUrl: ['', Validators.pattern(LINK)],
    instagramUrl: ['', Validators.pattern(LINK)],
    websiteUrl: ['', Validators.pattern(LINK)],
    adTitle: ['', [Validators.required, Validators.maxLength(TITLE_MAX)]],
    placement: [null as AdPlacement | null, Validators.required],
  });

  readonly sending = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly result = signal<AdSubmitResult | null>(null);
  readonly copied = signal(false);

  readonly bannerFile = signal<File | null>(null);
  readonly bannerPreview = signal<string | null>(null);
  readonly bannerSize = signal<{ w: number; h: number } | null>(null);
  readonly bannerError = signal<'fileType' | 'fileSize' | null>(null);
  readonly bannerTouched = signal(false);
  readonly dragging = signal(false);
  /** صورة الطلب المرفوض — بتفضل مستخدمة لحد ما التاجر يرفع غيرها */
  readonly existingBanner = signal<string | null>(null);
  editingCode: string | null = null;

  private copyTimer?: number;

  constructor() {
    // اسم الشركة مطلوب للشركات بس — الفرد بيكتب اسمه في ApplicantName
    this.ctrl('advertiserType')
      .valueChanges.pipe(takeUntilDestroyed())
      .subscribe((type) => {
        const company = this.ctrl('companyName');
        company.setValidators(type === 'business' ? [Validators.required, Validators.maxLength(120)] : Validators.maxLength(120));
        company.updateValueAndValidity({ emitEvent: false });
      });

    effect(
      () => {
        const draft = this.ads.draft();
        if (!draft) return;
        untracked(() => {
          this.resetForm();
          this.fillFrom(draft);
        });
      },
      { allowSignalWrites: true },
    );
  }

  ngOnDestroy(): void {
    this.revokePreview();
    clearTimeout(this.copyTimer);
  }

  get t() {
    return this.i18n.t().advertise;
  }

  get isBusiness(): boolean {
    return this.ctrl('advertiserType').value === 'business';
  }

  get selectedSpec() {
    return AD_PLACEMENT_SPECS[(this.ctrl('placement').value as AdPlacement) || 'top_carousel'];
  }

  get titleLength(): number {
    return (this.ctrl('adTitle').value || '').length;
  }

  get summaryLength(): number {
    return (this.ctrl('companySummary').value || '').length;
  }

  get previewSrc(): string | null {
    return this.bannerPreview() || this.existingBanner();
  }

  /** null لحد ما الأبعاد تتقري — وبعدها true لو النسبة قريبة من المقاس المقترح */
  get ratioMatches(): boolean | null {
    const size = this.bannerSize();
    if (!size) return null;
    const spec = this.selectedSpec;
    const expected = spec.width / spec.height;
    return Math.abs(size.w / size.h - expected) / expected <= RATIO_TOLERANCE;
  }

  get bannerMissing(): boolean {
    return !this.bannerFile() && !this.existingBanner();
  }

  get showBannerError(): boolean {
    return !!this.bannerError() || (this.bannerTouched() && this.bannerMissing);
  }

  get bannerErrorText(): string {
    const err = this.bannerError();
    return err ? this.t.errors[err] : this.t.errors.banner;
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
    const key: ErrorKey | null = c?.hasError('required')
      ? 'required'
      : c?.hasError('maxlength')
        ? name === 'companySummary'
          ? 'summaryMax'
          : 'maxlength'
        : c?.hasError('email')
          ? 'email'
          : c?.hasError('pattern')
            ? name === 'phoneNumber'
              ? 'phone'
              : 'url'
            : null;
    return key ? this.t.errors[key] : '';
  }

  /** بيضيف https:// لو المعلن كتب الرابط من غيرها */
  fixLink(name: LinkField): void {
    const c = this.ctrl(name);
    const value = (c.value || '').trim();
    if (value && !/^https?:\/\//i.test(value)) c.setValue(`https://${value}`);
  }

  // ───────── صورة البنر ─────────

  onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.setBanner(file);
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.setBanner(file);
  }

  removeBanner(): void {
    this.revokePreview();
    this.bannerFile.set(null);
    this.bannerSize.set(null);
    this.bannerError.set(null);
    this.existingBanner.set(null);
    this.bannerTouched.set(true);
  }

  private setBanner(file: File): void {
    this.bannerTouched.set(true);
    if (!IMAGE_TYPES.includes(file.type)) {
      this.bannerError.set('fileType');
      return;
    }
    if (file.size > MAX_BYTES) {
      this.bannerError.set('fileSize');
      return;
    }
    this.revokePreview();
    const url = URL.createObjectURL(file);
    this.bannerError.set(null);
    this.bannerFile.set(file);
    this.bannerPreview.set(url);
    this.bannerSize.set(null);
    const img = new Image();
    img.onload = () => this.bannerPreview() === url && this.bannerSize.set({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;
  }

  private revokePreview(): void {
    const url = this.bannerPreview();
    if (url) URL.revokeObjectURL(url);
    this.bannerPreview.set(null);
  }

  // ───────── الإرسال ─────────

  submit(): void {
    this.bannerTouched.set(true);
    if (this.form.invalid || this.bannerMissing || this.bannerError()) {
      this.form.markAllAsTouched();
      setTimeout(() => {
        const el = this.host.nativeElement.querySelector('.is-invalid, [aria-invalid="true"]') as HTMLElement | null;
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el?.focus({ preventScroll: true });
      });
      return;
    }

    this.sending.set(true);
    this.submitError.set(null);
    this.payload()
      .then((data) => {
        this.ads.submitAdRequest(data).subscribe({
          next: (res) => {
            this.sending.set(false);
            this.result.set(res);
            this.ads.draft.set(null);
            this.host.nativeElement.parentElement?.scrollTo({ top: 0, behavior: 'smooth' });
          },
          error: (err: unknown) => this.fail(err instanceof AdServiceError && err.kind === 'invalid' ? err.serverMessage : null),
        });
      })
      .catch(() => {
        this.existingBanner.set(null);
        this.bannerTouched.set(true);
        this.fail(this.t.errors.reupload);
      });
  }

  private fail(message: string | null): void {
    this.sending.set(false);
    this.submitError.set(message || this.t.errors.submit);
  }

  private async payload(): Promise<FormData> {
    this.links.forEach((l) => this.fixLink(l.name));
    const v = this.form.getRawValue();
    const data = new FormData();
    const add = (key: string, value: string | null | undefined) => {
      const clean = (value || '').trim();
      if (clean) data.append(key, clean);
    };
    // أسماء الحقول المطلوبة من الـ API
    add('ApplicantName', v.applicantName);
    add('PhoneNumber', compactPhone(v.phoneNumber || ''));
    add('CompanyName', this.isBusiness ? v.companyName : '');
    add('CompanySummary', v.companySummary);
    add('AdTitle', v.adTitle);
    add('FacebookUrl', v.facebookUrl);
    add('InstagramUrl', v.instagramUrl);
    add('WebsiteUrl', v.websiteUrl);
    const file = this.bannerFile() ?? (await this.existingBannerFile());
    if (file) data.append('Image', file, file.name);
    // حقول إضافية من الموقع — الـ API بيتجاهلها لحد ما تتضاف عنده
    add('AdvertiserType', v.advertiserType);
    add('Email', v.email);
    add('Placement', v.placement);
    add('PreviousTrackingCode', this.editingCode);
    return data;
  }

  /** الـ API مبيقبلش رابط صورة — عند إعادة التقديم من غير صورة جديدة بنبعت البنر القديم كملف */
  private async existingBannerFile(): Promise<File | null> {
    const url = this.existingBanner();
    if (!url) return null;
    const res = await fetch(url);
    if (!res.ok) throw new Error('banner');
    const blob = await res.blob();
    const name = url.split('/').pop()?.split('?')[0] || 'banner.jpg';
    return new File([blob], name, { type: blob.type || 'image/jpeg' });
  }

  private fillFrom(ad: AdRequest): void {
    this.editingCode = ad.trackingCode;
    this.form.patchValue({
      advertiserType: ad.advertiserType || (ad.companyName ? 'business' : 'individual'),
      applicantName: ad.applicantName,
      companyName: ad.companyName || '',
      phoneNumber: ad.phoneNumber,
      email: ad.email || '',
      companySummary: ad.companySummary || '',
      facebookUrl: ad.facebookUrl || '',
      instagramUrl: ad.instagramUrl || '',
      websiteUrl: ad.websiteUrl || '',
      adTitle: ad.adTitle,
      placement: ad.placement ?? null,
    });
    this.existingBanner.set(ad.imageUrl);
  }

  cancelEdit(): void {
    this.ads.draft.set(null);
    this.resetForm();
  }

  // ───────── حالة النجاح ─────────

  async copyCode(code: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const area = document.createElement('textarea');
      area.value = code;
      area.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    this.copied.set(true);
    clearTimeout(this.copyTimer);
    this.copyTimer = window.setTimeout(() => this.copied.set(false), 2200);
  }

  trackNow(code: string): void {
    this.ads.showTracking(code);
  }

  resetForm(): void {
    this.editingCode = null;
    this.form.reset({ advertiserType: 'individual' });
    this.removeBanner();
    this.bannerTouched.set(false);
    this.result.set(null);
    this.submitError.set(null);
    this.copied.set(false);
  }
}
