import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslatePipe} from '../../pipes/translate.pipe';

@Component({
  standalone: true,
  selector: 'app-privacy',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './privacy.html',
  styleUrls: ['./privacy.scss'],
})
export class PrivacyComponent {}
