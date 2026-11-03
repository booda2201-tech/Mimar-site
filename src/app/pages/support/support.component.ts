import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { APP_SUPPORT_EMAIL } from '../../core/site.config';
import { LegalShellComponent } from '../legal-shell.component';
import { copyText, usePageTitle } from '../page-utils';

interface Topic {
  icon: string;
  title: string;
  text: string;
  /** Pages that answer the topic directly instead of an email. */
  link?: { label: string; path: string; fragment?: string };
}

interface Faq {
  q: string;
  a: string;
  link?: { label: string; path: string; fragment?: string };
}

function mailto(subject: string, body = ''): string {
  const query = [`subject=${encodeURIComponent(subject)}`, body && `body=${encodeURIComponent(body)}`].filter(Boolean).join('&');
  return `mailto:${APP_SUPPORT_EMAIL}?${query}`;
}

const MESSAGE_TEMPLATE =
  'Hello M3mar Support,\n\n' +
  'Registered email or phone:\n' +
  'Order or RFQ number (if any):\n' +
  'Device model and app version:\n\n' +
  'How can we help?\n';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, LegalShellComponent],
  templateUrl: './support.component.html',
})
export class SupportComponent {
  readonly email = APP_SUPPORT_EMAIL;
  readonly packageName = 'com.hendal.m3mar';
  readonly mainMailto = mailto('M3mar Support Request', MESSAGE_TEMPLATE);

  readonly copied = signal(false);
  private copyTimer = 0;

  readonly checklist: string[] = [
    'The email or phone number registered to your account',
    'Your order or RFQ number, if your question is about one',
    'Your device model and the M3mar app version',
    'A screenshot of any error message you see',
  ];

  readonly topics: Topic[] = [
    { icon: 'manage_accounts', title: 'Account & sign-in', text: 'Trouble signing in, or updating the name, email, or phone number on your account.' },
    { icon: 'local_shipping', title: 'Orders & delivery', text: 'Order status, delivery address, quantities, or an issue with a delivered order.' },
    { icon: 'request_quote', title: 'Quotations (RFQs)', text: 'Submitting a request for quotation, reviewing offers, or negotiating prices.' },
    { icon: 'collections_bookmark', title: 'Material collections', text: 'Creating and organizing collections, or changing a collection cover photo.' },
    {
      icon: 'shield_person',
      title: 'Privacy & your data',
      text: 'Access, correct, or get a copy of the personal data we hold about you.',
      link: { label: 'Read the Privacy Policy', path: '/privacy' },
    },
    {
      icon: 'delete_forever',
      title: 'Delete your account',
      text: 'Log out to clear this device, or request full erasure of your account and data.',
      link: { label: 'See how to delete', path: '/privacy', fragment: 'delete-account' },
    },
  ];

  readonly faqs: Faq[] = [
    {
      q: "The app can't connect or keeps loading.",
      a: 'M3mar needs an internet connection to sign in, browse construction materials, place orders, and send RFQs. Check your Wi-Fi or mobile data, then try again. If it continues, email us with your device model and app version.',
    },
    {
      q: "I can't choose a cover photo for my collection.",
      a: 'M3mar asks for read-only access to your photo library only when you pick a collection cover. If you declined, allow photo access for M3mar in your device Settings, then try again.',
    },
    {
      q: 'How do I set my delivery address?',
      a: 'You type your delivery address manually in the app. M3mar never uses GPS and never asks for location permission.',
    },
    {
      q: 'Does M3mar store my payment card?',
      a: 'No. The app never asks for, processes, or stores credit or debit card numbers or CVV codes.',
    },
    {
      q: 'Is my password saved on my phone?',
      a: 'No. Your password is used only to sign you in and is never saved on your device. Logging out clears your session data from the device.',
    },
    {
      q: 'How do I delete my account and data?',
      a: 'Email us from your registered email address with the subject "Account Deletion Request". We delete your account and associated personal data within 30 days and confirm by email.',
      link: { label: 'Full deletion steps', path: '/privacy', fragment: 'delete-account' },
    },
  ];

  constructor() {
    usePageTitle('Support | M3mar');
    inject(DestroyRef).onDestroy(() => clearTimeout(this.copyTimer));
  }

  topicMailto(topic: Topic): string {
    return mailto(`M3mar Support - ${topic.title}`, MESSAGE_TEMPLATE);
  }

  async copyEmail(): Promise<void> {
    await copyText(APP_SUPPORT_EMAIL);
    this.copied.set(true);
    clearTimeout(this.copyTimer);
    this.copyTimer = window.setTimeout(() => this.copied.set(false), 2200);
  }
}
