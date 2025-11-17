import { GameEvent, GameMaster, GameSession, Player } from './pagemaster.types';

export enum PageMasterSocketEvents {
  JOIN_GAME_SESSION = 'joinGameSession',
  LEAVE_GAME_SESSION = 'leaveGameSession',
  LEFT_GAME_SESSION = 'leftGameSession',
  JOINED_GAME_SESSION = 'joinedGameSession',
  GAME_SESSION_UPDATED = 'gameSessionUpdated',
}

export type PageMasterSocketEventsPayloads = {
  [PageMasterSocketEvents.JOIN_GAME_SESSION]: { gameSessionId: string, participantId: string },
  [PageMasterSocketEvents.LEAVE_GAME_SESSION]: { gameSessionId: string },
  [PageMasterSocketEvents.LEFT_GAME_SESSION]: { gameSessionId: string },
  [PageMasterSocketEvents.JOINED_GAME_SESSION]: { gameSessionId: string, participantId: string },
  [PageMasterSocketEvents.GAME_SESSION_UPDATED]: { gameSession: GameSession, by: Player | GameMaster, event: GameEvent },
};

export function RoomId(gameSessionId: string): string {
  return `gameSession_${gameSessionId}`;
}