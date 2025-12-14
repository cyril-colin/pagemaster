import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerInventoryItemGive } from '@pagemaster/common/events-player.types';
import { SmartRoutes } from 'src/app/app.routes';
import { ImageComponent } from '../../../../../core/design-system/image.component';
import { ItemComponent } from '../../../../../core/player/inventories/items/item.component';
import { AbstractEventViewPlayerComponent } from './abstract-event-view-player.component';

@Component({
  selector: 'app-event-inventory-item-give',
  template: `
    @let e = event();
    @let fromPlayer = player();
    @let toPlayer = recipientPlayer();
    <a [routerLink]="playerUrl()"><ds-image [src]="fromPlayer?.avatar || ''" /></a>
    <span>gave</span>
    <app-item [item]="e.event.givenItem" [size]="'xs'" />
    <span>to</span>
    <a [routerLink]="recipientPlayerUrl()"><ds-image [src]="toPlayer?.avatar || ''" /></a>
  `,
  styleUrls: ['./event-view-common.scss'],
  styles: [`
    :host {
      display: flex;
      align-items: center;
      gap: var(--gap-small);
    }
  `],
  imports: [RouterModule, ImageComponent, ItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventInventoryItemGiveComponent extends AbstractEventViewPlayerComponent<EventPlayerInventoryItemGive> {
  protected recipientPlayer = computed(() => 
    this.gameSession.currentGameSession().players.find(p => p.id === this.event().event.toPlayerId),
  );

  protected recipientPlayerUrl() {
    const urlTree = this.router.createUrlTree(
      [
        '..',
        ...SmartRoutes.gameInstanceSession.children.playerLayout.path(this.recipientPlayer()?.id || '', 'details'),
      ],
      { relativeTo: this.route },
    );

    return decodeURIComponent(urlTree.toString());
  }
}
