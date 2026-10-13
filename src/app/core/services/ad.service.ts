import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, TimeoutError, catchError, map, retry, throwError, timeout, timer } from 'rxjs';
import { AD_ENDPOINTS, API_BASE } from '../site.config';
import { AdRequest, AdRequestDto, AdServiceError, AdStatus, AdSubmitResult } from '../models/ad.model';

export type AdView = 'create' | 'track';

const REQUEST_TIMEOUT = 20000;
const LAST_CODE_KEY = 'mimar-ad-last-code';
/** مخزن تجريبي قديم كان بيطلّع أكواد وهمية — بيتمسح من أجهزة اللي جرّبوا */
const LEGACY_MOCK_KEY = 'mimar-ad-requests';
/** أكواد المخزن ده: MM-AD-xxxx أو M-9xxxx (الحقيقية بتبدأ من M-10001) */
const LEGACY_CODE = /^(MM-AD-\d+|M-9\d{4})$/;

/** كل ردود الباك إند جاية بالشكل ده */
interface Envelope<T> {
  success: boolean;
  message?: string | null;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class AdService {
  private http = inject(HttpClient);

  readonly dialogOpen = signal(false);
  readonly view = signal<AdView>('create');
  /** طلب مرفوض راجع للتعديل — نموذج الإنشاء بيتملي منه */
  readonly draft = signal<AdRequest | null>(null);
  /** كود جاهز يتحط في نموذج المتابعة لما يتفتح */
  readonly trackCode = signal<string | null>(null);
  readonly lastCode = signal<string | null>(null);

  constructor() {
    removeStorage(LEGACY_MOCK_KEY);
    const saved = readStorage(LAST_CODE_KEY);
    if (saved && LEGACY_CODE.test(saved)) removeStorage(LAST_CODE_KEY);
    else this.lastCode.set(saved);
  }

  open(view: AdView = 'create'): void {
    this.view.set(view);
    if (view === 'track' && !this.trackCode()) this.trackCode.set(this.lastCode());
    this.dialogOpen.set(true);
  }

  close(): void {
    this.dialogOpen.set(false);
  }

  showTracking(code: string | null): void {
    this.trackCode.set(code);
    this.view.set('track');
  }

  resubmit(ad: AdRequest): void {
    this.draft.set(ad);
    this.view.set('create');
  }

  /** من غير إعادة محاولة تلقائية — لو الطلب وصل والرد اتأخر، الإعادة هتعمل طلب مكرر */
  submitAdRequest(data: FormData): Observable<AdSubmitResult> {
    return this.http.post<Envelope<unknown>>(`${API_BASE}${AD_ENDPOINTS.submit}`, data).pipe(
      timeout(REQUEST_TIMEOUT),
      map((res): AdSubmitResult => {
        const code = extractCode(res?.data);
        if (!code) throw new AdServiceError('network', res?.message || null);
        this.rememberCode(code);
        return { trackingCode: code };
      }),
      catchError((err) => throwError(() => toServiceError(err))),
    );
  }

  trackAdStatus(trackingCode: string, phone: string): Observable<AdRequest> {
    const params = { requestNumber: normalizeCode(trackingCode), phone: compactPhone(phone) };
    return this.http.get<Envelope<AdRequestDto[] | AdRequestDto | null>>(`${API_BASE}${AD_ENDPOINTS.track}`, { params }).pipe(
      timeout(REQUEST_TIMEOUT),
      retry({ count: 1, delay: (err) => (isConnectionError(err) ? timer(1500) : throwError(() => err)) }),
      map((res) => {
        const list = Array.isArray(res?.data) ? res.data : res?.data ? [res.data] : [];
        const dto = list.find((d) => d.requestNumber?.toUpperCase() === params.requestNumber) ?? list[0];
        if (!dto) throw new AdServiceError('not_found');
        return fromDto(dto);
      }),
      catchError((err) => throwError(() => toServiceError(err))),
    );
  }

  private rememberCode(code: string): void {
    this.lastCode.set(code);
    writeStorage(LAST_CODE_KEY, code);
  }
}

function fromDto(dto: AdRequestDto): AdRequest {
  return {
    id: dto.id,
    trackingCode: dto.requestNumber,
    applicantName: dto.applicantName,
    phoneNumber: dto.phoneNumber,
    companyName: dto.companyName || null,
    companySummary: dto.companySummary || null,
    adTitle: dto.adTitle,
    imageUrl: dto.displayImageUrl || dto.imageUrl || null,
    facebookUrl: dto.facebookUrl || null,
    instagramUrl: dto.instagramUrl || null,
    websiteUrl: dto.websiteUrl || null,
    status: toStatus(dto.status),
    rejectionReason: dto.rejectionReason || null,
    reviewedAt: asUtc(dto.reviewedAt),
    activeUntil: asUtc(dto.activeUntil),
    createdAt: asUtc(dto.createdAt) ?? dto.createdAt,
  };
}

/** السيرفر أحياناً بيرجّع التاريخ UTC من غير Z — من غيرها المتصفح بيقراه بتوقيت الجهاز */
function asUtc(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return /(Z|[+-]\d{2}:?\d{2})$/i.test(iso) ? iso : `${iso}Z`;
}

function toStatus(raw: string | null | undefined): AdStatus {
  const s = (raw || '').toLowerCase();
  if (s === 'approved' || s === 'active') return 'approved';
  if (s === 'rejected') return 'rejected';
  return 'pending';
}

/** رد الإنشاء ممكن يرجّع رقم الطلب لوحده أو الطلب كله */
function extractCode(data: unknown): string | null {
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return extractCode(data[0]);
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    const code = d['requestNumber'] ?? d['trackingCode'];
    return typeof code === 'string' && code ? code : null;
  }
  return null;
}

/** السيرفر ماردّش خالص (اتقطع أو البروكسي فشل) */
function isConnectionError(err: unknown): boolean {
  if (err instanceof TimeoutError) return true;
  if (!(err instanceof HttpErrorResponse)) return false;
  return err.status === 0 || err.status === 502 || err.status === 503 || err.status === 504;
}

function toServiceError(err: unknown): AdServiceError {
  if (err instanceof AdServiceError) return err;
  if (err instanceof HttpErrorResponse) {
    const body = err.error && typeof err.error === 'object' ? (err.error as Record<string, unknown>) : null;
    const message = typeof body?.['message'] === 'string' && body['message'] ? (body['message'] as string) : null;
    if (err.status === 404) return new AdServiceError('not_found', message);
    if (err.status >= 400 && err.status < 500) return new AdServiceError('invalid', message);
  }
  return new AdServiceError('network');
}

/** بنبعت الرقم من غير مسافات أو شرط علشان يتسجّل ويتقارن بشكل واحد */
export function compactPhone(value: string): string {
  return (value || '').trim().replace(/[\s-]/g, '');
}

/** بيقبل "M-10001" أو "m10001" أو "10001" ويرجّعها "M-10001" */
export function normalizeCode(code: string): string {
  const clean = (code || '').toUpperCase().replace(/\s/g, '');
  const num = clean.replace(/^M-?/, '');
  return /^\d+$/.test(num) ? `M-${num}` : clean;
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* المتصفح في وضع خاص أو المساحة خلصت — الطلب نفسه مش بيتأثر */
  }
}

function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* مفيش وصول للتخزين — مفيش حاجة تتمسح */
  }
}
