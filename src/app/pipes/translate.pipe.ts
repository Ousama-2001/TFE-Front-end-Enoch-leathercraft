import { Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../services/language.service';

@Pipe({
  name: 't',
  pure: false, // pour se mettre à jour quand on change la langue
  standalone: true, // 👉 IMPORTANT pour pouvoir l'importer dans les standalone components
})
export class TranslatePipe implements PipeTransform {
  constructor(private lang: LanguageService) {}

  transform(key: string): string {
    return this.lang.t(key);
  }
}
