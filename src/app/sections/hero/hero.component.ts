import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { LangService } from '../../core/i18n/lang.service';
import { AppLinkService } from '../../core/app-link.service';
import { StoreBadgeComponent } from '../../shared/app-download/store-badge.component';
import { TiltDirective } from '../../shared/tilt.directive';
import { PhoneMockComponent } from './phone-mock.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [NgFor, NgIf, StoreBadgeComponent, TiltDirective, PhoneMockComponent],
  templateUrl: './hero.component.html',
})
export class HeroComponent {
  readonly i18n = inject(LangService);
  readonly app = inject(AppLinkService);
}
