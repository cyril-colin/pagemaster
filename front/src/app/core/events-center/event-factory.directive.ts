import { Directive, inject, input, inputBinding, Type, ViewContainerRef } from '@angular/core';
import { EventPlayerTypes } from '@pagemaster/common/events-player.types';
import { EventBase } from '@pagemaster/common/events.types';
import { EventAvatarEditComponent } from './event-views/event-avatar-edit.component';
import { EventBarAddComponent } from './event-views/event-bar-add.component';
import { EventBarDeleteComponent } from './event-views/event-bar-delete.component';
import { EventBarEditComponent } from './event-views/event-bar-edit.component';
import { EventDescriptionEditComponent } from './event-views/event-description-edit.component';
import { EventDiceRollComponent } from './event-views/event-dice-roll.component';
import { EventInventoryAddComponent } from './event-views/event-inventory-add.component';
import { EventInventoryDeleteComponent } from './event-views/event-inventory-delete.component';
import { EventInventoryItemAddComponent } from './event-views/event-inventory-item-add.component';
import { EventInventoryItemDeleteComponent } from './event-views/event-inventory-item-delete.component';
import { EventInventoryItemEditComponent } from './event-views/event-inventory-item-edit.component';
import { EventInventoryUpdateComponent } from './event-views/event-inventory-update.component';
import { EventRenameComponent } from './event-views/event-rename.component';
import { EventStatusAddComponent } from './event-views/event-status-add.component';
import { EventStatusDeleteComponent } from './event-views/event-status-delete.component';
import { EventStatusEditComponent } from './event-views/event-status-edit.component';
import { PlayerBarPointAddEventViewComponent } from './event-views/player-bar-point-add-event-view.component';
import { PlayerBarPointRemoveEventViewComponent } from './event-views/player-bar-point-remove-event-view.component';

export const EVENT_COMPONENTS_MAP = {
  [EventPlayerTypes.PLAYER_NAME_EDIT]: EventRenameComponent,
  [EventPlayerTypes.PLAYER_AVATAR_EDIT]: EventAvatarEditComponent,
  [EventPlayerTypes.PLAYER_DESCRIPTION_EDIT]: EventDescriptionEditComponent,
  [EventPlayerTypes.PLAYER_BAR_ADD]: EventBarAddComponent,
  [EventPlayerTypes.PLAYER_BAR_EDIT]: EventBarEditComponent,
  [EventPlayerTypes.PLAYER_BAR_DELETE]: EventBarDeleteComponent,
  [EventPlayerTypes.PLAYER_STATUS_ADD]: EventStatusAddComponent,
  [EventPlayerTypes.PLAYER_STATUS_EDIT]: EventStatusEditComponent,
  [EventPlayerTypes.PLAYER_STATUS_DELETE]: EventStatusDeleteComponent,
  [EventPlayerTypes.PLAYER_INVENTORY_ADD]: EventInventoryAddComponent,
  [EventPlayerTypes.PLAYER_INVENTORY_UPDATE]: EventInventoryUpdateComponent,
  [EventPlayerTypes.PLAYER_INVENTORY_DELETE]: EventInventoryDeleteComponent,
  [EventPlayerTypes.PLAYER_INVENTORY_ITEM_ADD]: EventInventoryItemAddComponent,
  [EventPlayerTypes.PLAYER_INVENTORY_ITEM_EDIT]: EventInventoryItemEditComponent,
  [EventPlayerTypes.PLAYER_INVENTORY_ITEM_DELETE]: EventInventoryItemDeleteComponent,
  [EventPlayerTypes.PLAYER_BAR_POINT_REMOVE]: PlayerBarPointRemoveEventViewComponent,
  [EventPlayerTypes.PLAYER_BAR_POINT_ADD]: PlayerBarPointAddEventViewComponent,
  'dice-roll': EventDiceRollComponent,
} as const;


@Directive({
  selector: '[appEventFactory]',
})
export class EventFactoryDirective {
  public event = input.required<EventBase>();
  private vcr = inject(ViewContainerRef);

  ngOnChanges() {
    const eventValue = this.event();
    const componentType = EVENT_COMPONENTS_MAP[eventValue.type as keyof typeof EVENT_COMPONENTS_MAP] as Type<unknown>;
    if (componentType) {
      this.vcr.clear();
      this.vcr.createComponent(componentType, {
        bindings: [
          inputBinding('event', this.event),
        ],
      });
    }
  }
}