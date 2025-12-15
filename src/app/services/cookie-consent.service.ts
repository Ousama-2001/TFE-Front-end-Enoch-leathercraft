import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

export type CookieConsentChoice = 'accepted' | 'rejected' | 'custom';

export interface CookieConsent {
  choice: CookieConsentChoice;
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

const STORAGE_PREFIX = 'enoch_cookie_consent_v1';

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private consentSubject = new BehaviorSubject<CookieConsent | null>(null);
  consent$ = this.consentSubject.asObservable();

  constructor(private auth: AuthService) {
    this.reloadForCurrentUser();
  }

  // ✅ à appeler au login/logout (depuis AppComponent)
  reloadForCurrentUser(): void {
    this.consentSubject.next(this.read());
  }

  hasChoice(): boolean {
    return !!this.consentSubject.value;
  }

  getConsent(): CookieConsent | null {
    return this.consentSubject.value;
  }

  acceptAll(): void {
    const c: CookieConsent = {
      choice: 'accepted',
      necessary: true,
      preferences: true,
      analytics: true,
      marketing: true,
      updatedAt: new Date().toISOString(),
    };
    this.save(c);
  }

  rejectNonEssential(): void {
    const c: CookieConsent = {
      choice: 'rejected',
      necessary: true,
      preferences: false,
      analytics: false,
      marketing: false,
      updatedAt: new Date().toISOString(),
    };
    this.save(c);
  }

  saveCustom(prefs: Partial<Pick<CookieConsent, 'preferences' | 'analytics' | 'marketing'>>): void {
    const c: CookieConsent = {
      choice: 'custom',
      necessary: true,
      preferences: !!prefs.preferences,
      analytics: !!prefs.analytics,
      marketing: !!prefs.marketing,
      updatedAt: new Date().toISOString(),
    };
    this.save(c);
  }

  clear(): void {
    localStorage.removeItem(this.storageKey());
    this.consentSubject.next(null);
  }

  // ----------------- private -----------------

  private storageKey(): string {
    const userKey = this.auth.getUserKey();
    if (userKey) return `${STORAGE_PREFIX}__user__${userKey}`;
    return `${STORAGE_PREFIX}__guest`;
  }

  private save(consent: CookieConsent): void {
    localStorage.setItem(this.storageKey(), JSON.stringify(consent));
    this.consentSubject.next(consent);
  }

  private read(): CookieConsent | null {
    try {
      const raw = localStorage.getItem(this.storageKey());
      if (!raw) return null;

      const parsed = JSON.parse(raw) as CookieConsent;
      if (!parsed || parsed.necessary !== true) return null;

      return parsed;
    } catch {
      return null;
    }
  }
}
