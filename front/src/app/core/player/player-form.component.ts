import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Player } from '@pagemaster/common/pagemaster.types';
import { GameSessionPermissions } from '@pagemaster/common/permissions.types';
import { CurrentGameSessionState } from '../current-game-session.state';
import { CurrentParticipantState } from '../current-participant.state';
import { CardComponent } from '../design-system/card.component';
import { PictureControlComponent } from './avatar/picture-control.component';
import { BarsControlComponent } from './bars/bars-control.component';
import {
  InventoryListComponent,
} from './inventories/inventory-list.component';
import { NameControlComponent } from './names/name-control.component';
import { StatusControlComponent } from './statuses/status-control.component';




@Component({
  selector: 'app-player-form',
  template: `
    <form>
      <ds-card>
        <div class="identity">
          
            <div class="identity-data">
            <app-picture-control
              [player]="existingPlayer()"
              [permissions]="permissions()"
              [gameSession]="currentSession()!.gameSession"
            />
            <app-name-control
              [player]="existingPlayer()"
              [permissions]="permissions()"
              [gameSession]="currentSession()!.gameSession"
            />
            <app-status-control
              [player]="existingPlayer()"
              [permissions]="permissions()"
              [gameSession]="currentSession()!.gameSession"
            />
            
          </div>
        </div>

        <app-bars-control
          [player]="existingPlayer()"
          [permissions]="permissions()"
          [gameSession]="currentSession()!.gameSession"
        />
      </ds-card>

      
      <app-inventory-list
        [player]="existingPlayer()"
        [permissions]="permissions()"
        [gameSession]="currentSession()!.gameSession"
      />
    </form>
  `,
  styles: [`
    form {
      display: flex;
      flex-direction: column;
      gap: var(--gap-large);
      width: 100%;
    }

    .identity {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
    }

    .identity-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 var(--gap-large);
      gap: var(--gap-medium);
      flex: 1;
    }
  `],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NameControlComponent,
    PictureControlComponent,
    BarsControlComponent,
    StatusControlComponent,
    InventoryListComponent,
    CardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerFormComponent  {
  protected gameSession = inject(CurrentGameSessionState);
  protected participant = inject(CurrentParticipantState);
  protected currentSession = computed(() => {
    const gameSession = this.gameSession.currentGameSessionNullable();
    const participant = this.participant.currentParticipant();
    if (gameSession && participant) {
      return { gameSession, participant };
    }
    return null;
  });
  public existingPlayer = input.required<Player>();
  public permissions = input.required<GameSessionPermissions>();
  public newPlayer = output<Player>();
  public fb = inject(FormBuilder);
}