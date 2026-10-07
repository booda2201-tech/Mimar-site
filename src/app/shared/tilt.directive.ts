import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';

/** ميل ثلاثي الأبعاد خفيف مع حركة الماوس — بيتعطّل مع اللمس و reduced-motion */
@Directive({ selector: '[appTilt]', standalone: true })
export class TiltDirective {
  @Input() appTilt: number | '' = 8;

  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor() {
    const s = this.el.nativeElement.style;
    s.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
    s.transformStyle = 'preserve-3d';
    s.willChange = 'transform';
  }

  @HostListener('pointermove', ['$event'])
  onMove(e: PointerEvent): void {
    if (this.reduced || e.pointerType !== 'mouse') return;
    const node = this.el.nativeElement;
    const r = node.getBoundingClientRect();
    const max = Number(this.appTilt) || 8;
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    node.style.transform = `perspective(1000px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`;
  }

  @HostListener('pointerleave')
  onLeave(): void {
    this.el.nativeElement.style.transform = '';
  }
}
