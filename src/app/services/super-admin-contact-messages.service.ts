import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactMessageAdmin {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;

  handled: boolean;
  handledAt?: string | null;
  handledBy?: string | null;
}

@Injectable({ providedIn: 'root' })
export class SuperAdminContactMessagesService {
  private readonly api = 'http://localhost:8080/api/super-admin/contact-messages';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ContactMessageAdmin[]> {
    return this.http.get<ContactMessageAdmin[]>(this.api);
  }

  updateHandled(id: number, value: boolean): Observable<ContactMessageAdmin> {
    const params = new HttpParams().set('value', value);
    return this.http.patch<ContactMessageAdmin>(
      `${this.api}/${id}/handled`,
      null,
      { params }
    );
  }
}
