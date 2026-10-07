import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, timeout } from 'rxjs';
import { API_BASE, LEAD_ENDPOINTS, LeadKind, SITE } from './site.config';

export type LeadResult =
  | { kind: 'sent' }
  | { kind: 'fallback'; whatsappUrl: string | null; mailtoUrl: string };

export interface LeadLine {
  label: string;
  value: string;
}

@Injectable({ providedIn: 'root' })
export class LeadService {
  private http = inject(HttpClient);

  /** التاب المفتوح في نموذج التواصل — بوابات "انضم إلينا" بتغيّره */
  readonly activeForm = signal<LeadKind>('contact');

  openForm(kind: LeadKind): void {
    this.activeForm.set(kind);
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * بيحاول يبعت للباك إند، ولو المسار مش موجود أو فيه مشكلة شبكة
   * بيرجّع روابط واتساب/بريد جاهزة بنفس البيانات بدل ما الطلب يضيع.
   */
  submit(kind: LeadKind, payload: Record<string, unknown>, subject: string, lines: LeadLine[]): Observable<LeadResult> {
    return this.http.post(`${API_BASE}${LEAD_ENDPOINTS[kind]}`, { type: kind, ...payload, source: 'website' }).pipe(
      timeout(15000),
      map((): LeadResult => ({ kind: 'sent' })),
      catchError(() => of(this.fallback(subject, lines))),
    );
  }

  private fallback(subject: string, lines: LeadLine[]): LeadResult {
    const body = lines
      .filter((l) => l.value.trim())
      .map((l) => `${l.label}: ${l.value}`)
      .join('\n');
    const text = `${subject}\n\n${body}`;
    const wa = SITE.contact.whatsapp;
    return {
      kind: 'fallback',
      whatsappUrl: wa ? `https://wa.me/${wa}?text=${encodeURIComponent(text)}` : null,
      mailtoUrl: `mailto:${SITE.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    };
  }
}
