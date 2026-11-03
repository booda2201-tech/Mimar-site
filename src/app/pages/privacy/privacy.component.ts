import { Component, DestroyRef, NgZone, afterNextRender, inject, signal } from '@angular/core';
import { NgClass, NgFor } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { APP_SUPPORT_EMAIL } from '../../core/site.config';
import { LegalShellComponent, scrollToSection } from '../legal-shell.component';
import { copyText, usePageTitle } from '../page-utils';

interface TocItem {
  id: string;
  label: string;
}

interface DataItem {
  icon: string;
  title: string;
  text: string;
}

interface Permission {
  name: string;
  icon: string;
  used: boolean;
  status: string;
  purpose: string;
}

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [NgFor, NgClass, LegalShellComponent],
  templateUrl: './privacy.component.html',
})
export class PrivacyComponent {
  private zone = inject(NgZone);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly email = APP_SUPPORT_EMAIL;
  readonly effectiveDate = 'November 3, 2026';
  readonly packageName = 'com.hendal.m3mar';

  readonly active = signal(this.route.snapshot.fragment || 'overview');
  readonly copied = signal(false);
  private copyTimer = 0;

  readonly toc: TocItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'information-we-collect', label: 'Information We Collect' },
    { id: 'not-collected', label: 'What We Do Not Collect' },
    { id: 'how-we-use', label: 'How We Use Information' },
    { id: 'permissions', label: 'Device Permissions' },
    { id: 'payments', label: 'Payments' },
    { id: 'sharing', label: 'How We Share Information' },
    { id: 'storage-security', label: 'Storage & Security' },
    { id: 'retention', label: 'Data Retention' },
    { id: 'your-rights', label: 'Your Rights' },
    { id: 'delete-account', label: 'Delete Your Account' },
    { id: 'children', label: "Children's Privacy" },
    { id: 'governing-framework', label: 'Governing Framework' },
    { id: 'changes', label: 'Changes to This Policy' },
    { id: 'contact', label: 'Contact Us' },
  ];

  readonly collected: DataItem[] = [
    { icon: 'badge', title: 'Full name', text: 'Identifies your account and appears on your orders and RFQs.' },
    { icon: 'alternate_email', title: 'Email address', text: 'Used to sign in, send account communications, and respond to support requests.' },
    { icon: 'call', title: 'Phone number', text: 'Used to contact you about your orders, deliveries, and quotations.' },
    {
      icon: 'password',
      title: 'Password',
      text: 'Used only to authenticate you. It is sent over an encrypted connection and is never saved on your device.',
    },
    {
      icon: 'home_pin',
      title: 'Delivery address',
      text: 'Typed manually as text. The app never uses GPS and never asks for location permission.',
    },
    { icon: 'receipt_long', title: 'Order details', text: 'Materials, quantities, delivery address, order status, and order history.' },
    {
      icon: 'request_quote',
      title: 'RFQs & negotiations',
      text: 'Your requests for quotation and their negotiation history, including quantities, prices, offers, and counter-offers.',
    },
    {
      icon: 'photo_library',
      title: 'Collection cover photo',
      text: 'An image you pick from your photo library as the cover of a material collection. Only the photo you select is read and uploaded.',
    },
  ];

  readonly notCollected: DataItem[] = [
    { icon: 'location_off', title: 'No location', text: 'No GPS, no location permission, and no background location tracking.' },
    { icon: 'no_photography', title: 'No camera', text: 'The app never opens or requests access to your camera.' },
    { icon: 'mic_off', title: 'No microphone', text: 'The app never records audio or requests microphone access.' },
    { icon: 'contacts', title: 'No contacts', text: 'Your address book is never read, uploaded, or requested.' },
    { icon: 'credit_card_off', title: 'No card data', text: 'No credit or debit card numbers and no CVV codes.' },
    { icon: 'block', title: 'No ads or trackers', text: 'No advertising, no advertising SDKs, and no third-party tracking tools.' },
  ];

  readonly permissions: Permission[] = [
    {
      name: 'Internet access',
      icon: 'wifi',
      used: true,
      status: 'Used',
      purpose: 'Required to sign in, browse construction materials, place orders, and send and negotiate RFQs.',
    },
    {
      name: 'Photo Library (read-only)',
      icon: 'photo_library',
      used: true,
      status: 'Used on request',
      purpose:
        'Requested only when you choose a cover image for a material collection. The app reads the single photo you select and never modifies or deletes your photos.',
    },
    { name: 'Camera', icon: 'photo_camera', used: false, status: 'Not requested', purpose: 'The app has no camera features.' },
    { name: 'Microphone', icon: 'mic', used: false, status: 'Not requested', purpose: 'The app has no audio or voice features.' },
    { name: 'Contacts', icon: 'contacts', used: false, status: 'Not requested', purpose: 'The app never accesses your address book.' },
    {
      name: 'Location (foreground or background)',
      icon: 'my_location',
      used: false,
      status: 'Not requested',
      purpose: 'Delivery addresses are entered manually as text.',
    },
    {
      name: 'Advertising ID & tracking',
      icon: 'ads_click',
      used: false,
      status: 'Not used',
      purpose: 'The app shows no ads and contains no advertising or third-party tracking SDKs.',
    },
  ];

  readonly uses: string[] = [
    'Create, secure, and manage your M3mar account and authenticate you when you sign in.',
    'Process, fulfil, and deliver your orders for construction materials to the address you provide.',
    'Create, manage, and negotiate your RFQs and deliver quotations back to you.',
    'Display your material collections, including the cover photo you choose.',
    'Contact you about your orders, deliveries, quotations, and support requests.',
    'Protect the service and our users against fraud, abuse, and unauthorized access.',
    'Comply with our obligations under applicable law.',
  ];

  readonly rights: DataItem[] = [
    { icon: 'info', title: 'Right to be informed', text: 'To know how and why your personal data is collected and processed, as described in this policy.' },
    { icon: 'visibility', title: 'Right of access', text: 'To request access to the personal data we hold about you.' },
    { icon: 'download', title: 'Right to obtain a copy', text: 'To receive a copy of your personal data in a clear and readable format.' },
    { icon: 'edit_note', title: 'Right to correction', text: 'To have inaccurate, incomplete, or outdated personal data corrected.' },
    { icon: 'delete_forever', title: 'Right to destruction', text: 'To have your personal data deleted when it is no longer needed. See Delete Your Account below.' },
    { icon: 'undo', title: 'Right to withdraw consent', text: 'To withdraw your consent to processing at any time, without affecting processing carried out before withdrawal.' },
  ];

  readonly deletionMailto =
    `mailto:${APP_SUPPORT_EMAIL}?subject=${encodeURIComponent('Account Deletion Request - M3mar')}` +
    `&body=${encodeURIComponent(
      'Hello M3mar Support,\n\nPlease permanently delete my M3mar account and all associated personal data.\n\nRegistered email:\nRegistered phone number:\n\nThank you.',
    )}`;

  constructor() {
    usePageTitle('Privacy Policy | M3mar');

    let observer: IntersectionObserver | undefined;
    afterNextRender(() => (observer = this.watchSections()));
    inject(DestroyRef).onDestroy(() => {
      observer?.disconnect();
      clearTimeout(this.copyTimer);
    });
  }

  /** `href="#id"` would resolve against `<base href="/">` and leave this page, so in-page links scroll manually. */
  goTo(event: Event, id: string): void {
    event.preventDefault();
    // The mobile menu sits above the content, so it has to collapse before the scroll target is measured.
    (event.currentTarget as HTMLElement | null)?.closest('details')?.removeAttribute('open');
    if (!scrollToSection(id)) return;
    this.router.navigate([], { relativeTo: this.route, fragment: id, replaceUrl: true });
    this.active.set(id);
  }

  async copyEmail(): Promise<void> {
    await copyText(APP_SUPPORT_EMAIL);
    this.copied.set(true);
    clearTimeout(this.copyTimer);
    this.copyTimer = window.setTimeout(() => this.copied.set(false), 2200);
  }

  number(id: string): string {
    return String(this.toc.findIndex((i) => i.id === id) + 1).padStart(2, '0');
  }

  private watchSections(): IntersectionObserver {
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        const first = this.toc.find((i) => visible.has(i.id));
        if (first && first.id !== this.active()) this.zone.run(() => this.active.set(first.id));
      },
      { rootMargin: '-96px 0px -55% 0px' },
    );
    for (const item of this.toc) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return observer;
  }
}
