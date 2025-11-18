import { EventPlayerDescriptionEdit } from '../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';

export const playerDescriptionEditHandler: GameEventHandlerFn<EventPlayerDescriptionEdit> = (event, gameSession) => {
  const player = gameSession.players.find(p => p.id === event.playerId);
  if (!player) {
    throw new Error('Player not found in game session');
  }

  player.description = event.newDescription;
  return gameSession;
}


