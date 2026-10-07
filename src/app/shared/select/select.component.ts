import { Component, ElementRef, HostListener, Input, OnDestroy, ViewChild, forwardRef } from '@angular/core';
import { NgFor, NgIf, NgStyle } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Option } from '../../core/i18n/dictionary';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [NgFor, NgIf, NgStyle],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectComponent), multi: true }],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class SelectComponent implements ControlValueAccessor, OnDestroy {
  @Input() options: Option[] = [];
  @Input() placeholder = '';
  @Input() invalid = false;
  @Input() inputId = '';

  @ViewChild('trigger') triggerRef?: ElementRef<HTMLButtonElement>;

  /** المنيو بيتنقل لـ body عشان أي transform/filter في الأب بيكسر position: fixed */
  @ViewChild('menu') set menuRef(ref: ElementRef<HTMLElement> | undefined) {
    this.menuEl = ref?.nativeElement;
    if (this.menuEl && this.menuEl.parentElement !== document.body) {
      document.body.appendChild(this.menuEl);
      this.updateMenuPosition();
    }
  }
  private menuEl?: HTMLElement;

  open = false;
  disabled = false;
  value: string | null = null;
  activeIndex = -1;
  menuStyle: Record<string, string> = {};
  dir = 'rtl';

  private onChange: (v: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor(private host: ElementRef<HTMLElement>) {}

  get selectedLabel(): string {
    return this.options.find((o) => o.value === this.value)?.label ?? this.placeholder;
  }

  get hasValue(): boolean {
    return this.value !== null && this.value !== '';
  }

  toggle(): void {
    if (this.disabled) return;
    this.open ? this.close() : this.openMenu();
  }

  choose(option: Option): void {
    this.value = option.value;
    this.onChange(this.value);
    this.close();
    this.triggerRef?.nativeElement.focus();
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled) return;
    const keys = ['ArrowDown', 'ArrowUp', 'Enter', ' ', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    if (!this.open) {
      this.openMenu();
      return;
    }
    const last = this.options.length - 1;
    if (event.key === 'ArrowDown') this.activeIndex = Math.min(last, this.activeIndex + 1);
    else if (event.key === 'ArrowUp') this.activeIndex = Math.max(0, this.activeIndex - 1);
    else if (event.key === 'Home') this.activeIndex = 0;
    else if (event.key === 'End') this.activeIndex = last;
    else if (this.options[this.activeIndex]) this.choose(this.options[this.activeIndex]);
  }

  writeValue(value: string | null): void {
    this.value = value;
  }

  registerOnChange(fn: (v: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private openMenu(): void {
    this.open = true;
    this.dir = getComputedStyle(this.host.nativeElement).direction;
    this.activeIndex = Math.max(0, this.options.findIndex((o) => o.value === this.value));
    this.updateMenuPosition();
    document.addEventListener('scroll', this.onAnyScroll, { capture: true, passive: true });
  }

  private close(): void {
    if (!this.open) return;
    this.open = false;
    document.removeEventListener('scroll', this.onAnyScroll, { capture: true });
    this.onTouched();
  }

  private updateMenuPosition(): void {
    const el = this.triggerRef?.nativeElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = window.visualViewport?.height ?? window.innerHeight;
    const gap = 6;
    const edge = 12;
    const spaceBelow = vh - rect.bottom - edge;
    const spaceAbove = rect.top - edge;
    const openUp = spaceBelow < 220 && spaceAbove > spaceBelow;
    const maxH = Math.min(300, (openUp ? spaceAbove : spaceBelow) - gap);
    const width = Math.min(rect.width, vw - edge * 2);
    const left = Math.min(Math.max(edge, rect.left), vw - width - edge);
    this.menuStyle = {
      position: 'fixed',
      left: `${left}px`,
      width: `${width}px`,
      maxHeight: `${Math.max(120, maxH)}px`,
      ...(openUp
        ? { bottom: `${vh - rect.top + gap}px`, top: 'auto', transformOrigin: 'bottom' }
        : { top: `${rect.bottom + gap}px`, bottom: 'auto', transformOrigin: 'top' }),
    };
    if (this.menuEl) Object.assign(this.menuEl.style, this.menuStyle);
  }

  @HostListener('window:resize')
  onViewportChange(): void {
    if (this.open) this.updateMenuPosition();
  }

  private readonly onAnyScroll = (event: Event): void => {
    if (this.menuEl && event.target instanceof Node && this.menuEl.contains(event.target)) return;
    this.updateMenuPosition();
  };

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    const target = event.target as Node;
    if (!this.host.nativeElement.contains(target) && !this.menuEl?.contains(target)) this.close();
  }

  ngOnDestroy(): void {
    document.removeEventListener('scroll', this.onAnyScroll, { capture: true });
    this.menuEl?.remove();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.close();
  }
}
