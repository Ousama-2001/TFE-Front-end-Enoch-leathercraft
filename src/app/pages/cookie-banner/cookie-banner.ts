import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CookieConsentService } from '../../services/cookie-consent.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './cookie-banner.html',
  styleUrls: ['./cookie-banner.scss'],
})
export class CookieBannerComponent implements OnInit, OnDestroy {
  visible = false;
  customizeOpen = false;

  // toggles (custom)
  preferences = false;
  analytics = false;
  marketing = false;

  private sub?: Subscription;

  constructor(public cookies: CookieConsentService) {}

  ngOnInit(): void {
    // visible si aucun choix au démarrage
    this.visible = !this.cookies.hasChoice();

    // préremplir si déjà un consent
    const c = this.cookies.getConsent();
    if (c) {
      this.preferences = c.preferences;
      this.analytics = c.analytics;
      this.marketing = c.marketing;
    }

    // ✅ si consent change ailleurs (ex: "manage cookies" plus tard), on réagit
    this.sub = this.cookies.consent$.subscribe((consent) => {
      this.visible = !consent;
      if (consent) {
        this.preferences = consent.preferences;
        this.analytics = consent.analytics;
        this.marketing = consent.marketing;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  acceptAll(): void {
    this.cookies.acceptAll();
    this.close();
  }

  rejectAll(): void {
    this.cookies.rejectNonEssential();
    this.close();
  }

  openCustomize(): void {
    this.customizeOpen = !this.customizeOpen;
  }

  saveCustom(): void {
    this.cookies.saveCustom({
      preferences: this.preferences,
      analytics: this.analytics,
      marketing: this.marketing,
    });
    this.close();
  }

  close(): void {
    this.visible = false;
    this.customizeOpen = false;
  }
}
