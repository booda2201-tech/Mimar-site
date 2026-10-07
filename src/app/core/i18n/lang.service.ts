import { Injectable, computed, effect, signal } from '@angular/core';
import { DICTIONARIES, Dictionary, Lang } from './dictionary';

const STORAGE_KEY = 'mimar-lang';

@Injectable({ providedIn: 'root' })
export class LangService {
  readonly lang = signal<Lang>(localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'ar');
  readonly t = computed<Dictionary>(() => DICTIONARIES[this.lang()]);
  readonly isAr = computed(() => this.lang() === 'ar');

  constructor() {
    effect(() => {
      const lang = this.lang();
      const html = document.documentElement;
      html.lang = lang;
      html.dir = lang === 'ar' ? 'rtl' : 'ltr';
      localStorage.setItem(STORAGE_KEY, lang);
      document.title = lang === 'ar' ? 'معمار | حمّل تطبيق مواد البناء' : 'MIMAR | Get the building materials app';
    });
  }

  toggle(): void {
    this.lang.update((l) => (l === 'ar' ? 'en' : 'ar'));
  }

  pick<T>(value: { ar: T; en: T }): T {
    return value[this.lang()];
  }
}
