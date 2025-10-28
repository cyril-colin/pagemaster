import { GameEvent, GameInstance, Participant } from './pagemaster.types';

export enum PageMasterSocketEvents {
  JOIN_GAME_INSTANCE = 'joinGameInstance',
  LEAVE_GAME_INSTANCE = 'leaveGameInstance',
  LEFT_GAME_INSTANCE = 'leftGameInstance',
  JOINED_GAME_INSTANCE = 'joinedGameInstance',
  GAME_INSTANCE_UPDATED = 'gameInstanceUpdated',
}

export type PageMasterSocketEventsPayloads = {
  [PageMasterSocketEvents.JOIN_GAME_INSTANCE]: { gameInstanceId: string, participantId: string },
  [PageMasterSocketEvents.LEAVE_GAME_INSTANCE]: { gameInstanceId: string },
  [PageMasterSocketEvents.LEFT_GAME_INSTANCE]: { gameInstanceId: string },
  [PageMasterSocketEvents.JOINED_GAME_INSTANCE]: { gameInstanceId: string, participantId: string },
  [PageMasterSocketEvents.GAME_INSTANCE_UPDATED]: { gameInstance: GameInstance, by: Participant, event: GameEvent },
};

export function RoomId(gameInstanceId: string): string {
  return `gameInstance_${gameInstanceId}`;
}