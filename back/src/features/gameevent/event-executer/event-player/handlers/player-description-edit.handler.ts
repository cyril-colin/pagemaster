import { EventPlayerDescriptionEdit } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';
import { assertPlayerExists } from '../event-player.executer';

export const playerDescriptionEditHandler: GameEventHandlerFn<EventPlayerDescriptionEdit> = (event, gameSession) => {
  const player = assertPlayerExists(gameSession, event.playerId);

  player.description = event.newDescription;
  return gameSession;
}


