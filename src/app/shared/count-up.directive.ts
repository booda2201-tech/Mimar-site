import { Directive, ElementRef, Input, OnChanges, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';

@Directive({ selector: '[appCountUp]', standalone: true })
export class CountUpDirective implements OnChanges, OnDestroy {
  @Input() appCountUp = 0;

  private observer?: IntersectionObserver;
  private tween?: gsap.core.Tween;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnChanges(): void {
    const node = this.el.nativeElement;
    node.textContent = '0';
    this.observer?.disconnect();
    this.observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      this.observer?.disconnect();
      const counter = { v: 0 };
      this.tween = gsap.to(counter, {
        v: this.appCountUp,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate: () => (node.textContent = Math.round(counter.v).toLocaleString('en-US')),
      });
    });
    this.observer.observe(node);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.tween?.kill();
  }
}
