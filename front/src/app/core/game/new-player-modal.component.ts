import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AttributeBar, defaultInventories } from '@pagemaster/common/attributes.types';
import { GameSession, ParticipantType, Player } from '@pagemaster/common/pagemaster.types';
import { ButtonComponent } from '../design-system/button.component';
import {
  ModalLayoutComponent,
  ModalLayoutFooterComponent,
  ModalLayoutHeaderComponent,
  ModalLayoutSectionComponent,
} from '../modal/modal-layout';
import { PlayerFormComponent, PlayerFormValue } from './player-form.component';

@Component({
  selector: 'app-new-player-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ds-modal-layout>
      <ds-modal-layout-header title="Add New Player">
      </ds-modal-layout-header>

      <ds-modal-layout-section>
        <app-player-form (playerChange)="onPlayerChange($event)" />
      </ds-modal-layout-section>

      <ds-modal-layout-footer>
        <ds-button mode="primary" (click)="save()" [state]="getSaveState()">Add Player</ds-button>
      </ds-modal-layout-footer>
    </ds-modal-layout>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }
  `],
  imports: [
    ButtonComponent,
    PlayerFormComponent,
    ModalLayoutComponent,
    ModalLayoutHeaderComponent,
    ModalLayoutSectionComponent,
    ModalLayoutFooterComponent,
  ],
})
export class NewPlayerModalComponent {
  public gameSession = input.required<GameSession>();
  public result = output<Player | null>();
  
  protected playerData: PlayerFormValue | null = null;
  
  protected onPlayerChange(player: PlayerFormValue): void {
    this.playerData = player;
  }
  
  protected isValid(): boolean {
    return !!(
      this.playerData &&
      this.playerData.name
    );
  }

  protected getSaveState() {
    return this.isValid() ? { state: 'default' as const } : { state: 'error' as const, message: 'Please fill all fields' };
  }
  
  protected save(): void {
    if (this.isValid() && this.playerData) {
      const playerId = `player-${this.playerData.name}-${Date.now()}`;
      const quickBars = (this.gameSession().quickValues?.bars || []) as AttributeBar[];
      
      // Use bars directly from quickValues (same IDs, like statuses)
      const playerBars: AttributeBar[] = [...quickBars];
      
      const newPlayer: Player = {
        type: ParticipantType.Player,
        id: playerId,
        name: this.playerData.name,
        description: '',
        avatar: '',
        attributes: {
          bar: playerBars,
          status: [],
          inventory: Object.values(defaultInventories),
        },
      };
      
      this.result.emit(newPlayer);
    }
  }
}
