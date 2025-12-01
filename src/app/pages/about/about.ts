import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslatePipe} from '../../pipes/translate.pipe';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './about.html',
  styleUrls: ['./about.scss'],
})
export class AboutComponent {}
