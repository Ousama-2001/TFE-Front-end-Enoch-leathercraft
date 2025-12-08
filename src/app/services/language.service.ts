// src/app/services/language.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Lang, TRANSLATIONS } from '../i18n/translations';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'enoch_lang';
  private currentLangSubject: BehaviorSubject<Lang>;
  currentLang$;

  constructor() {
    const saved = (localStorage.getItem(this.STORAGE_KEY) as Lang) || 'fr';
    this.currentLangSubject = new BehaviorSubject<Lang>(saved);
    this.currentLang$ = this.currentLangSubject.asObservable();
  }

  get currentLang(): Lang {
    return this.currentLangSubject.value;
  }

  setLanguage(lang: Lang): void {
    if (lang === this.currentLang) return;
    this.currentLangSubject.next(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
  }

  t(key: string): string {
    const dict = TRANSLATIONS[this.currentLang] || {};

    // On renvoie la valeur même si c'est une chaîne vide
    if (Object.prototype.hasOwnProperty.call(dict, key)) {
      return dict[key];
    }

    // fallback si la clé n'existe pas
    return key;
  }

}
