import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { defaultBar, defaultInventories } from '@pagemaster/common/attributes.types';
import { ParticipantType, Player } from '@pagemaster/common/pagemaster.types';
import { ButtonComponent } from '../design-system/button.component';
import { PlayerFormComponent, PlayerFormValue } from './player-form.component';

@Component({
  selector: 'app-new-player-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-container">
      <header class="modal-header">
        <h2>Add New Player</h2>
        <ds-button mode="secondary" (click)="cancel()" [icon]="'close'"/>
      </header>
      
      <div class="modal-content">
        <app-player-form 
          (playerChange)="onPlayerChange($event)"
        />
      </div>
      
      <footer class="modal-footer">
        <ds-button mode="secondary" (click)="cancel()">Cancel</ds-button>
        <ds-button mode="primary" (click)="save()" [state]="getSaveState()">Add Player</ds-button>
      </footer>
    </div>
  `,
  styles: [`
    .modal-container {
      display: flex;
      flex-direction: column;
      width: 500px;
      max-width: 90vw;
      max-height: 90vh;
      background-color: var(--color-background-secondary);
      border-radius: var(--view-border-radius);
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--padding-medium);
      background-color: var(--color-background-tertiary);
      border-bottom: var(--view-border);
    }

    .modal-header h2 {
      margin: 0;
      font-size: var(--text-size-xlarge);
      color: var(--text-primary);
    }

    .modal-content {
      flex: 1;
      padding: var(--padding-large);
      overflow-y: auto;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--gap-medium);
      padding: var(--padding-medium);
      background-color: var(--color-background-tertiary);
      border-top: var(--view-border);
    }
  `],
  imports: [ButtonComponent, PlayerFormComponent],
})
export class NewPlayerModalComponent {
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
      const newPlayer: Player = {
        type: ParticipantType.Player,
        id: `player-${this.playerData.name}-${Date.now()}`,
        name: this.playerData.name,
        description: '',
        picture: '',
        attributes: {
          bar: Object.values(defaultBar),
          status: [],
          inventory: Object.values(defaultInventories),
        },
      };
      
      this.result.emit(newPlayer);
    }
  }
  
  protected cancel(): void {
    this.result.emit(null);
  }
}
