import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Player } from '@pagemaster/common/pagemaster.types';
import { CurrentGameSessionState } from 'src/app/core/current-game-session.state';
import { ButtonComponent } from 'src/app/core/design-system/button.component';
import {
  ModalLayoutComponent,
  ModalLayoutFooterComponent,
  ModalLayoutHeaderComponent,
  ModalLayoutSectionComponent,
} from 'src/app/core/modal/modal-layout';
import { PlayerButtonComponent } from 'src/app/core/player/player-button.component';

@Component({
  selector: 'app-give-item-modal',
  standalone: true,
  template: `
    <ds-modal-layout>
      <ds-modal-layout-header [title]="'Give Item To...'"></ds-modal-layout-header>
      
      <ds-modal-layout-section>
        <div class="players-list">
          @for(player of availablePlayers(); track player.id) {
            <app-player-button 
              [player]="player"
              (clicked)="selectRecipient(player)"
            />
          } @empty {
            <p class="no-players">No other players available</p>
          }
        </div>
      </ds-modal-layout-section>
      
      <ds-modal-layout-footer>
        <ds-button [mode]="'secondary'" (click)="cancel.emit()">Cancel</ds-button>
      </ds-modal-layout-footer>
    </ds-modal-layout>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }

    ds-modal-layout-section {
      overflow-y: auto;
    }

    .players-list {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
      padding: var(--padding-small);
    }

    .no-players {
      text-align: center;
      color: var(--text-secondary);
      padding: var(--padding-large);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    ModalLayoutComponent,
    ModalLayoutHeaderComponent,
    ModalLayoutSectionComponent,
    ModalLayoutFooterComponent,
    PlayerButtonComponent,
  ],
})
export class GiveItemModalComponent {
  public currentOwnerId = input.required<string>();
  public recipientSelected = output<Player>();
  public cancel = output<void>();
  
  protected gameSession = inject(CurrentGameSessionState);
  
  protected availablePlayers = computed(() => {
    const allPlayers = this.gameSession.currentGameSession().players;
    const ownerId = this.currentOwnerId();
    
    // Filter out the current owner and return only players
    return allPlayers.filter(player => player.id !== ownerId);
  });

  protected selectRecipient(player: Player): void {
    this.recipientSelected.emit(player);
  }
}
