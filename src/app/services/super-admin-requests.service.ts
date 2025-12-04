import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReactivationRequest {
  id: number;
  email: string;
  createdAt: string;
  handled: boolean;
  handledAt?: string | null;
  handledBy?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class SuperAdminRequestsService {
  private readonly api =
    'http://localhost:8080/api/super-admin/reactivation-requests';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ReactivationRequest[]> {
    return this.http.get<ReactivationRequest[]>(this.api);
  }

  updateHandled(id: number, value: boolean): Observable<ReactivationRequest> {
    const params = new HttpParams().set('value', value);
    return this.http.patch<ReactivationRequest>(
      `${this.api}/${id}/handled`,
      null,
      { params }
    );
  }
}
