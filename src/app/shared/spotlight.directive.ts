import { Directive, ElementRef, HostListener, inject } from '@angular/core';

/** بيحدّث --mx / --my علشان توهّج .spotlight يتبع الماوس */
@Directive({ selector: '[appSpotlight]', standalone: true, host: { class: 'spotlight' } })
export class SpotlightDirective {
  private el = inject<ElementRef<HTMLElement>>(ElementRef);

  @HostListener('pointermove', ['$event'])
  onMove(e: PointerEvent): void {
    if (e.pointerType !== 'mouse') return;
    const node = this.el.nativeElement;
    const r = node.getBoundingClientRect();
    node.style.setProperty('--mx', `${e.clientX - r.left}px`);
    node.style.setProperty('--my', `${e.clientY - r.top}px`);
  }
}
