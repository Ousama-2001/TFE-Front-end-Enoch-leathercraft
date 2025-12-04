import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslatePipe} from '../../pipes/translate.pipe';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './terms.html',
  styleUrls: ['./terms.scss'],
})
export class TermsComponent {
  currentYear = new Date().getFullYear();
}
