import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Component({
  selector: 'app-description-view',
  template: `
    <div class="description" [innerHTML]="renderedMarkdown()"></div>
  `,
  styles: [`
    :host {
      display: flex;
      width: 100%;
      padding: 0 var(--gap-large);
    }
    
    .description {
      font-size: var(--text-size-medium);
      color: var(--text-primary);
      font-weight: var(--text-weight-normal);
      margin: 0;
      min-height: 60px;
      
      /* Markdown styling */
      :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
        margin: var(--gap-small) 0;
        color: var(--text-primary);
      }
      
      :deep(p) {
        margin: var(--gap-small) 0;
      }
      
      :deep(ul), :deep(ol) {
        margin: var(--gap-small) 0;
        padding-left: var(--gap-large);
      }
      
      :deep(code) {
        background: var(--background-tertiary);
        padding: 2px 4px;
        border-radius: 3px;
        font-family: monospace;
      }
      
      :deep(pre) {
        background: var(--background-tertiary);
        padding: var(--gap-small);
        border-radius: var(--view-border-radius);
        overflow-x: auto;
      }
      
      :deep(blockquote) {
        border-left: 3px solid var(--color-primary);
        padding-left: var(--gap-medium);
        margin: var(--gap-small) 0;
        color: var(--text-secondary);
      }
      
      :deep(strong) {
        font-weight: var(--text-weight-bold);
      }
      
      :deep(em) {
        font-style: italic;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescriptionViewComponent {
  public description = input.required<string>();
  private sanitizer = inject(DomSanitizer);
  
  protected renderedMarkdown = computed<SafeHtml>(() => {
    const markdown = this.description();
    if (!markdown) {
      return '';
    }
    
    // Configure marked options
    marked.setOptions({
      breaks: true, // Convert \n to <br>
      gfm: true, // GitHub Flavored Markdown
    });
    
    const html = marked.parse(markdown, { async: false });
    return this.sanitizer.sanitize(1, html) || '';
  });
}
