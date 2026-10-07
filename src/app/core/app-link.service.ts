import { Injectable, signal } from '@angular/core';
import { SITE } from './site.config';

export type Store = 'ios' | 'android';
export type Platform = Store | 'desktop';

const QR_PARAM = 'app';

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'desktop';
}

@Injectable({ providedIn: 'root' })
export class AppLinkService {
  readonly platform = detectPlatform();
  readonly isMobile = this.platform !== 'desktop';
  readonly hasApps = !!(SITE.apps.ios || SITE.apps.android);
  readonly dialogOpen = signal(false);

  /** الكود بيفتح الموقع على الموبايل بالـ param ده، فيتحوّل تلقائياً للمتجر المناسب */
  readonly qrTarget = `${location.origin}${location.pathname}?${QR_PARAM}=1`;

  constructor() {
    const params = new URLSearchParams(location.search);
    if (!params.has(QR_PARAM)) return;
    params.delete(QR_PARAM);
    const query = params.toString();
    history.replaceState(null, '', `${location.pathname}${query ? `?${query}` : ''}${location.hash}`);
    queueMicrotask(() => this.launch());
  }

  storeUrl(store: Store): string {
    return SITE.apps[store];
  }

  /** الزرار الرئيسي: على الموبايل يفتح التطبيق/المتجر مباشرة، وعلى الديسكتوب يفتح نافذة التحميل */
  launch(): void {
    const url = this.platform !== 'desktop' ? this.storeUrl(this.platform) : '';
    if (url) this.openNative(url);
    else this.dialogOpen.set(true);
  }

  openStore(store: Store): void {
    const url = this.storeUrl(store);
    if (!url) this.dialogOpen.set(true);
    else if (store === this.platform) this.openNative(url);
    else window.open(url, '_blank', 'noopener');
  }

  close(): void {
    this.dialogOpen.set(false);
  }

  private openNative(storeUrl: string): void {
    const scheme = SITE.apps.scheme;
    if (!scheme) {
      location.href = storeUrl;
      return;
    }
    // لو الصفحة لسه ظاهرة بعد المهلة يبقى التطبيق مش متثبّت
    const fallback = window.setTimeout(() => {
      if (!document.hidden) location.href = storeUrl;
    }, 1600);
    document.addEventListener('visibilitychange', () => document.hidden && clearTimeout(fallback), { once: true });
    location.href = scheme;
  }
}
