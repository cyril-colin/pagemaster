import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MainTitleService {
  private readonly titleSignal = signal('');
  /**
   * Read-only signal of the current title.
   * Components can read or subscribe to this signal.
   */
  readonly title = this.titleSignal.asReadonly();

  /**
   * Update the title from anywhere.
   * @param title new title string
   */
  setTitle(title: string): void {
    this.titleSignal.set(title);
  }

  /**
   * Get the current title synchronously.
   */
  getTitle(): string {
    return this.titleSignal();
  }

  /**
   * Reset the title to empty string (optional).
   */
  clearTitle(): void {
    this.titleSignal.set('');
  }
}
