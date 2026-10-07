import { isDevMode } from '@angular/core';

/**
 * كل بيانات الشركة والتواصل في مكان واحد.
 * ⚠️ القيم اللي عليها TODO افتراضية من لوحة التحكم ولازم تتغيّر بالبيانات الحقيقية قبل النشر.
 */
export const SITE = {
  logo: 'assets/brand/mimar-logo.jpg',

  contact: {
    /** TODO: رقم الخط الساخن الحقيقي */
    phone: '+965 2225 1234',
    /** TODO: رقم واتساب الشركة بصيغة دولية بدون + أو مسافات — لو فاضي زرار واتساب بيختفي */
    whatsapp: '96522251234',
    email: 'support@mimar.com.kw',
    address: { ar: 'شرق، شارع أحمد الجابر، مدينة الكويت', en: 'Sharq, Ahmad Al-Jaber St., Kuwait City' },
    /** TODO: مواعيد العمل الحقيقية */
    hours: { ar: 'السبت – الخميس، 8 ص – 8 م', en: 'Sat – Thu, 8 AM – 8 PM' },
    /** TODO: رابط Google Maps الدقيق للمقر */
    mapUrl: 'https://maps.google.com/?q=Ahmad+Al-Jaber+Street+Sharq+Kuwait+City',
  },

  /** TODO: السجل التجاري الحقيقي */
  commercialRegistration: '45821',

  /** TODO: روابط حقيقية — أي رابط فاضي أيقونته مش هتظهر */
  social: {
    instagram: '',
    x: '',
    tiktok: '',
    snapchat: '',
    linkedin: '',
  },

  /**
   * TODO: روابط التطبيق على المتاجر — لو فاضية بيظهر "قريباً".
   * scheme: الـ deep link بتاع التطبيق (مثلاً mimar://) — لو موجود الموبايل بيحاول يفتح التطبيق الأول وبعدين المتجر.
   */
  apps: { ios: '', android: '', scheme: '' },

  /** TODO: عدد المستخدمين الحقيقي — الباك إند مفيهوش endpoint عام بيرجّعه */
  usersCount: 1200,
};

const PROD_API = 'https://alhendalcompany-001-site13.jtempurl.com';

/** في التطوير بنعدّي من proxy.conf.json، وفي الإنتاج دومين الموقع لازم يتضاف لـ CORS في الباك إند */
export const API_BASE = isDevMode() ? '' : PROD_API;

/**
 * مسارات استقبال النماذج — مش موجودة في الباك إند لسه.
 * لحد ما تتعمل، الموقع بيحوّل الطلب لواتساب أو البريد تلقائياً.
 */
export const LEAD_ENDPOINTS = {
  contact: '/api/Contact',
  merchant: '/api/Leads/merchants',
  supplier: '/api/Leads/suppliers',
} as const;

export type LeadKind = keyof typeof LEAD_ENDPOINTS;
