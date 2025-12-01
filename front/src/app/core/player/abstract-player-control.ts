import { Directive, inject, input } from '@angular/core';
import { EventPlayerBase } from '@pagemaster/common/events.types';
import { GameSession, Player } from '@pagemaster/common/pagemaster.types';
import { GameSessionPermissions } from '@pagemaster/common/permissions.types';
import { GameEventRepository } from '../repositories/game-event.repository';

@Directive()
export abstract class AbstractPlayerControl {
  public player = input.required<Player>();
  public gameSession = input.required<GameSession>();
  public permissions = input.required<GameSessionPermissions>();

  protected gameEventRepository = inject(GameEventRepository);


  protected prepareEvent(type: EventPlayerBase['type']): Omit<EventPlayerBase, 'id' | 'timestamp'> {
    return {
      type,
      gameSessionId: this.gameSession().id,
      playerId: this.player().id,
    };
  }
}