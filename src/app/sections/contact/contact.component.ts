import { Component, inject, signal } from '@angular/core';
import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LangService } from '../../core/i18n/lang.service';
import { LeadLine, LeadResult, LeadService } from '../../core/lead.service';
import { LeadKind, SITE } from '../../core/site.config';
import { Dictionary, Option } from '../../core/i18n/dictionary';
import { SelectComponent } from '../../shared/select/select.component';
import { RevealDirective } from '../../shared/reveal.directive';

type FieldKey = keyof Dictionary['forms']['fields'];

const PHONE = /^\+?[\d\s-]{8,16}$/;

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, NgTemplateOutlet, ReactiveFormsModule, SelectComponent, RevealDirective],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  readonly i18n = inject(LangService);
  readonly leads = inject(LeadService);
  private fb = inject(FormBuilder);
  readonly site = SITE;
  readonly telHref = `tel:${SITE.contact.phone.replace(/\s/g, '')}`;

  readonly kinds: { key: LeadKind; icon: string }[] = [
    { key: 'contact', icon: 'chat' },
    { key: 'merchant', icon: 'engineering' },
    { key: 'supplier', icon: 'storefront' },
  ];

  readonly forms: Record<LeadKind, FormGroup> = {
    contact: this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(PHONE)]],
      email: ['', Validators.email],
      inquiryType: [null as string | null, Validators.required],
      orderNumber: [''],
      message: ['', Validators.required],
    }),
    merchant: this.fb.group({
      company: ['', Validators.required],
      contactPerson: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(PHONE)]],
      email: ['', Validators.email],
      activity: [null as string | null, Validators.required],
      governorate: [null as string | null, Validators.required],
      cr: [''],
      monthlyVolume: [null as string | null],
      credit: [false],
      notes: [''],
    }),
    supplier: this.fb.group({
      company: ['', Validators.required],
      brand: [''],
      contactPerson: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(PHONE)]],
      email: ['', [Validators.required, Validators.email]],
      origin: [null as string | null],
      specialty: [null as string | null, Validators.required],
      productsCount: [null as string | null],
      catalogUrl: [''],
      notes: [''],
    }),
  };

  readonly sending = signal(false);
  readonly result = signal<LeadResult | null>(null);

  get form(): FormGroup {
    return this.forms[this.leads.activeForm()];
  }

  get t() {
    return this.i18n.t().forms;
  }

  selectTab(kind: LeadKind): void {
    this.leads.activeForm.set(kind);
    this.result.set(null);
  }

  label(name: string): string {
    return this.t.fields[name as FieldKey];
  }

  ctrl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }

  showError(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  errorText(name: string): string {
    const c = this.form.get(name);
    if (c?.hasError('required')) return this.t.errors.required;
    if (c?.hasError('pattern')) return this.t.errors.phone;
    if (c?.hasError('email')) return this.t.errors.email;
    return '';
  }

  submit(): void {
    const form = this.form;
    if (form.invalid) {
      form.markAllAsTouched();
      setTimeout(() =>
        document
          .querySelector<HTMLElement>('#lead-form input.is-invalid, #lead-form textarea.is-invalid, #lead-form button[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    const kind = this.leads.activeForm();
    const value = form.getRawValue() as Record<string, unknown>;
    this.sending.set(true);
    this.leads.submit(kind, value, this.subject(kind, value), this.lines(kind, value)).subscribe((res) => {
      this.sending.set(false);
      this.result.set(res);
      if (res.kind === 'sent') form.reset({ credit: false });
    });
  }

  reset(): void {
    this.forms[this.leads.activeForm()].reset({ credit: false });
    this.result.set(null);
  }

  private subject(kind: LeadKind, v: Record<string, unknown>): string {
    const who = (v['company'] || v['name'] || '') as string;
    return `[MIMAR] ${this.t.titles[kind]} — ${who}`;
  }

  private lines(kind: LeadKind, v: Record<string, unknown>): LeadLine[] {
    const optionSets: Partial<Record<FieldKey, Option[]>> = {
      inquiryType: this.t.options.inquiry,
      activity: this.t.options.activity,
      governorate: this.t.options.governorate,
      monthlyVolume: this.t.options.volume,
      origin: this.t.options.origin,
      specialty: this.t.options.specialty,
      productsCount: this.t.options.productsCount,
    };
    return Object.keys(this.forms[kind].controls).map((key) => {
      const raw = v[key];
      const opts = optionSets[key as FieldKey];
      let value = '';
      if (typeof raw === 'boolean') value = raw ? '✓' : '';
      else if (opts) value = opts.find((o) => o.value === raw)?.label ?? '';
      else value = (raw ?? '').toString();
      return { label: this.t.fields[key as FieldKey], value };
    });
  }
}
