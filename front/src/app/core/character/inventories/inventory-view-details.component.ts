import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Character } from '@pagemaster/common/pagemaster.types';
import { CurrentSessionState } from '../../current-session.state';
import { Inventory } from './inventories-control.component';

@Component({
  selector: 'app-inventory-view-details',
  template: `
    @let inv = inventory();
    <h2>{{inv.def.name}}</h2>
    @if(isManager()) {
      <button (click)="addItem()">➕</button>
    }
    <ul>
      @for(item of inv.instance.current; track item.id) {
        <li>{{item.id}}
          @if(isManager()) {
            <button (click)="deleteItem(item)">🗑️</button>
          }
        </li>
      }
    </ul>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      gap: var(--gap-medium);
      width: 100%;
      color: var(--text-primary-inverted);
    }
    h2 {
      color: var(--text-primary-inverted);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryViewDetailsComponent {
  public character = input.required<Character>();
  public inventory = input.required<Inventory>();
  public output = output<{ itemId: string }>();
  private currentSessionState = inject(CurrentSessionState);
  protected isManager = this.currentSessionState.allowedToEditCharacter(this.character);

  protected deleteItem(item: { id: string }) {
    this.output.emit({ itemId: item.id });
  }

  protected addItem() {

  }
}
