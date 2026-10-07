import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, shareReplay, timeout } from 'rxjs';
import { API_BASE, SITE } from './site.config';

interface Envelope<T> {
  success: boolean;
  data: T;
}

export interface Category {
  id: number;
  nameAr: string;
  nameEn: string | null;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  children: Category[];
}

export interface Brand {
  id: number;
  nameAr: string;
  nameEn: string | null;
  isActive: boolean;
  productsCount: number;
  logoUrl?: string | null;
}

export interface Product {
  id: number;
  nameAr: string;
  nameEn: string | null;
  mainImageUrl: string | null;
  price: number;
  finalPrice: number;
  discount: { type: 'percentage' | 'fixed'; value: number } | null;
  category: { nameAr: string; nameEn: string | null } | null;
  brand: { nameAr: string; nameEn: string | null } | null;
  isActive: boolean;
}

export interface Advertisement {
  id: number;
  titleAr: string;
  titleEn: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  imageUrl: string | null;
  badgeTextAr: string | null;
  badgeTextEn: string | null;
  buttonTextAr: string | null;
  buttonTextEn: string | null;
  endDate: string | null;
  isActive: boolean;
  isRunning: boolean;
  displayOrder: number;
  products: { id: number; mainImageUrl: string | null }[];
}

export interface CatalogStats {
  products: number;
  users: number;
  categories: number;
  offers: number;
}

const REQUEST_TIMEOUT = 15000;

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);

  readonly categories$ = this.get<Category[]>('/api/Categories/tree').pipe(
    map((list) => list.filter((c) => c.isActive).sort((a, b) => a.displayOrder - b.displayOrder)),
    shareReplay(1),
  );

  readonly brands$ = this.get<Brand[]>('/api/Brands').pipe(
    map((list) => list.filter((b) => b.isActive)),
    shareReplay(1),
  );

  readonly products$ = this.get<Product[]>('/api/Products').pipe(
    map((list) => list.filter((p) => p.isActive)),
    shareReplay(1),
  );

  readonly offers$ = this.get<Product[]>('/api/Products/discounted').pipe(
    map((list) => list.filter((p) => p.isActive && p.finalPrice < p.price)),
    shareReplay(1),
  );

  readonly advertisements$ = this.get<Advertisement[]>('/api/Advertisements').pipe(
    map((list) => list.filter((a) => a.isActive && a.isRunning).sort((a, b) => a.displayOrder - b.displayOrder)),
    shareReplay(1),
  );

  readonly stats$: Observable<CatalogStats | null> = forkJoin({
    products: this.products$,
    categories: this.categories$,
    offers: this.offers$,
  }).pipe(
    map(({ products, categories, offers }) => {
      const stats = {
        products: products.length,
        users: SITE.usersCount,
        categories: categories.reduce((n, c) => n + 1 + (c.children?.length || 0), 0),
        offers: offers.length,
      };
      return stats.products || stats.categories ? stats : null;
    }),
    shareReplay(1),
  );

  /** أي فشل في الـ API بيرجع ليستة فاضية — والأقسام اللي بتعتمد عليها بتختفي بهدوء */
  private get<T extends unknown[]>(path: string): Observable<T> {
    return this.http.get<Envelope<T>>(`${API_BASE}${path}`).pipe(
      timeout(REQUEST_TIMEOUT),
      map((res) => (Array.isArray(res?.data) ? res.data : ([] as unknown as T))),
      catchError(() => of([] as unknown as T)),
    );
  }
}
