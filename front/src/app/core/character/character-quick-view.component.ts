import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Character, GameDef } from '@pagemaster/common/pagemaster.types';
import { AvatarViewComponent } from './avatar/avatar-view.component';
import { BarListViewComponent } from './bars/bar-list-view.component';
import { CharacterAttributesService } from './character-attributes.service';
import { InventoryListViewComponent } from './inventories/inventory-list-view.component';
import { NameViewComponent } from './names/name-view.component';
import { StatusListViewComponent } from './statuses/status-list-view.component';

@Component({
  selector: 'app-character-quick-view',
  template: `
    @let char = character();
    
    <div class="resume">
      <app-avatar-view [source]="char.picture"/>
      <div class="info">
        <div class="info-name">
          <app-name-view [name]="char.name" />
        </div>
        <app-status-list-view [statuses]="playerStatuses()" />
        <app-bar-list-view [bars]="playerBars()" />
      </div>
    </div>
    <div class="inventories">
      <app-inventory-list-view [inventories]="playerInventories()" [character]="char"/>
    </div>
    
    
  
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
      width: 100%;
      align-items: center;
    }
    .resume {
      display: flex;
      flex-direction: row;
      gap: var(--gap-medium);
      width: 100%;
      align-items: center;
    }

    app-avatar-view {
      width: 70px;
      border-radius: 50%;
      overflow: hidden;
    }

    .info {
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
      width: 100%;
      align-items: center;
    }

  `],

  imports: [
    AvatarViewComponent,
    NameViewComponent,
    BarListViewComponent,
    StatusListViewComponent,
    InventoryListViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterQuickViewComponent {
  private characterAttributesService = inject(CharacterAttributesService);
  public character = input.required<Character>();
  public gameDef = input.required<GameDef>();
  protected playerBars = computed(() => {
    return this.characterAttributesService.mapPlayerBars(
      this.character(),
      this.gameDef(),
    );
  });

  protected playerStatuses = computed(() => {
    return this.characterAttributesService.mapPlayerStatuses(
      this.character(),
      this.gameDef(),
    );
  });

  protected playerInventories = computed(() => {
    return this.characterAttributesService.mapPlayerInventories(
      this.character(),
      this.gameDef(),
    );
  });
}