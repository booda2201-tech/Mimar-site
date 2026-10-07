import { AfterViewInit, Directive, ElementRef, HostListener, inject, signal } from '@angular/core';

/** بيحسب نسبة السحب في شريط أفقي (rail) علشان مؤشر التقدّم — بيشتغل مع RTL و LTR */
@Directive({ selector: '[appRail]', standalone: true, exportAs: 'appRail' })
export class RailDirective implements AfterViewInit {
  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly progress = signal(0);

  ngAfterViewInit(): void {
    requestAnimationFrame(() => this.update());
  }

  @HostListener('scroll')
  @HostListener('window:resize')
  update(): void {
    const { scrollLeft, clientWidth, scrollWidth } = this.el.nativeElement;
    this.progress.set(scrollWidth > 0 ? Math.min(100, ((Math.abs(scrollLeft) + clientWidth) / scrollWidth) * 100) : 100);
  }
}
