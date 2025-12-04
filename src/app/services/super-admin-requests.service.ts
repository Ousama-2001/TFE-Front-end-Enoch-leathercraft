// src/app/services/super-admin-requests.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type RequestType = 'CONTACT' | 'REACTIVATION';
export type RequestStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

export interface AdminRequest {
  id: number;
  type: RequestType;        // "CONTACT" ou "REACTIVATION"
  email: string;            // email de l'utilisateur
  subject?: string;
  message: string;
  status: RequestStatus;    // "PENDING" | "IN_PROGRESS" | "RESOLVED"
  createdAt: string;        // ISO date

  // optionnels si ton back les ajoute plus tard
  resolvedAt?: string;
  resolvedByEmail?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SuperAdminRequestsService {

  private readonly api = 'http://localhost:8080/api/super-admin/requests';

  constructor(private http: HttpClient) {}

  // Récupérer toutes les demandes
  getAll(): Observable<AdminRequest[]> {
    return this.http.get<AdminRequest[]>(this.api);
  }

  // Marquer une demande "EN COURS"
  markInProgress(id: number): Observable<AdminRequest> {
    return this.http.patch<AdminRequest>(`${this.api}/${id}/status`, {
      status: 'IN_PROGRESS'
    });
  }

  // Marquer une demande "RÉSOLUE"
  markResolved(id: number): Observable<AdminRequest> {
    return this.http.patch<AdminRequest>(`${this.api}/${id}/status`, {
      status: 'RESOLVED'
    });
  }
}
