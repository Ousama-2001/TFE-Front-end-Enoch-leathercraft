import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Coupon {
  id: number;
  code: string;
  percent: number;

  startsAt?: string | null; // ISO
  endsAt?: string | null;   // ISO

  active: boolean;
  maxUses?: number | null;
  usedCount?: number | null;

  // back renvoie aussi :
  validNow?: boolean | null;
  status?: 'ACTIVE' | 'UPCOMING' | 'EXPIRED' | 'INACTIVE' | 'LIMIT_REACHED' | string | null;
}

export interface CouponRequest {
  code: string;
  percent: number;
  startsAt?: string | null;
  endsAt?: string | null;
  active?: boolean;
  maxUses?: number | null;
}

export interface CouponValidateResponse {
  code: string;
  valid: boolean;
  percent?: number | null;
  status?: string | null;
}

@Injectable({ providedIn: 'root' })
export class CouponService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // ✅ Admin
  getAllAdmin(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${this.baseUrl}/admin/coupons`);
  }

  createAdmin(body: CouponRequest): Observable<Coupon> {
    return this.http.post<Coupon>(`${this.baseUrl}/admin/coupons`, body);
  }

  updateAdmin(id: number, body: CouponRequest): Observable<Coupon> {
    return this.http.put<Coupon>(`${this.baseUrl}/admin/coupons/${id}`, body);
  }

  deleteAdmin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/coupons/${id}`);
  }

  // ✅ Public validate (utile côté checkout)
  validate(code: string): Observable<CouponValidateResponse> {
    return this.http.get<CouponValidateResponse>(`${this.baseUrl}/coupons/validate`, {
      params: { code },
    });
  }
}
