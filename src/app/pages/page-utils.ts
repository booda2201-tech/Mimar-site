import { DestroyRef, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

/** Must be called in an injection context. Restores the previous title when the page is destroyed. */
export function usePageTitle(value: string): void {
  const title = inject(Title);
  const previous = title.getTitle();
  title.setTitle(value);
  inject(DestroyRef).onDestroy(() => title.setTitle(previous));
}

export async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
}
