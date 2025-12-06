import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventLootBox } from '@pagemaster/common/events.types';
import { ItemComponent } from '../../../../../core/player/inventories/items/item.component';
import { AbstractEventViewComponent } from './abstract-event-view.component';


@Component({
  selector: 'app-event-loot-box',
  template: `
    <h3>New EventLootBox View</h3>
    <section class="loot-box-items">
    @for(i of event().event.lootBox.items; track i.item.id) {
      <app-item [item]="i.item" [size]="'xs'" />
    }
    </section>
  `,
  styleUrls: ['./event-view-common.scss'],
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: var(--gap-medium);
    }
    .loot-box-items {
      display: flex;
      flex-wrap: wrap;
      gap: var(--gap-small);
    }`],
  imports: [RouterModule, ItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventLootBoxComponent extends AbstractEventViewComponent<EventLootBox> {
}
