export type AdStatus = 'pending' | 'approved' | 'rejected';

export type AdPlacement = 'top_carousel' | 'mid_banner' | 'promo_card';

/** المعلن ممكن يكون فرد (مهندس / مقاول / فني) بيعرض خدماته، أو شركة / مؤسسة */
export type AdvertiserType = 'individual' | 'business';

/** شكل الطلب زي ما بيرجع من GET /api/AdvertisementRequests/track */
export interface AdRequestDto {
  id: number;
  requestNumber: string;
  applicantName: string;
  phoneNumber: string;
  companyName: string | null;
  companySummary: string | null;
  adTitle: string;
  imageUrl: string | null;
  /** الصورة بعد ما الإدارة تظبطها للعرض — لو موجودة بتتقدّم على imageUrl */
  displayImageUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  websiteUrl: string | null;
  /** Pending / Approved / Rejected */
  status: string;
  rejectionReason: string | null;
  reviewedAt: string | null;
  activeUntil: string | null;
  createdAt: string;
}

export interface AdRequest {
  id: number | string;
  trackingCode: string;
  applicantName: string;
  phoneNumber: string;
  companyName: string | null;
  companySummary: string | null;
  adTitle: string;
  imageUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  websiteUrl: string | null;
  status: AdStatus;
  rejectionReason: string | null;
  /** تاريخ الموافقة — بداية ظهور الإعلان */
  reviewedAt: string | null;
  /** آخر يوم للعرض — المدة بيحددها الباك إند */
  activeUntil: string | null;
  createdAt: string;
  /** حقول من الموقع لسه مش راجعة من الـ API */
  advertiserType?: AdvertiserType;
  email?: string | null;
  placement?: AdPlacement | null;
}

export interface AdSubmitResult {
  trackingCode: string;
}

export type AdErrorKind = 'not_found' | 'invalid' | 'network';

export class AdServiceError extends Error {
  /** رسالة الباك إند نفسها لما تكون مفيدة للمستخدم (زي أخطاء التحقق) */
  constructor(
    readonly kind: AdErrorKind,
    readonly serverMessage: string | null = null,
  ) {
    super(kind);
  }
}

/** المقاسات المقترحة لكل مكان ظهور — بتتعرض للمعلن وبنقارن بيها أبعاد الصورة المرفوعة */
export const AD_PLACEMENT_SPECS: Record<AdPlacement, { width: number; height: number; ratio: string }> = {
  top_carousel: { width: 1280, height: 720, ratio: '16:9' },
  mid_banner: { width: 1200, height: 400, ratio: '3:1' },
  promo_card: { width: 800, height: 400, ratio: '2:1' },
};

export const AD_ADVERTISER_TYPES: AdvertiserType[] = ['individual', 'business'];

/** رقم الطلب من الباك إند بالشكل M-10001 */
export const AD_TRACKING_CODE = /^M-\d{3,10}$/;
