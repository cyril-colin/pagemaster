import { AttributeBar, AttributeInventory, AttributeStatus } from './attributes.types';

export type GameSession = {
  /**
   * A unique identifier for this game session.
   */
  readonly id: string,

  /**
   * The version of the game session. This is incremented each time the game session is updated.
   * This allows clients to know if they have the latest version of the game session or not.
   * 
   * This is useful for optimistic concurrency control: when a client wants to update the game session,
   * it can check if the version it has is the same as the version on the server. If not, it means
   * that someone else has updated the game session in the meantime, and the client should fetch
   * the latest version before making its own updates.
   */
  version: number,
  master: GameMaster,
  players: Player[],
};


export enum ParticipantType {
  GameMaster = 'gameMaster',
  Player = 'player',
}

export type GameMaster =  ParticipantBase & {
  type: ParticipantType.GameMaster,
  id: ParticipantType.GameMaster,
  /**
   * Should be unique across all players in the same {@link GameSession}.
   */
  name: string,
};

export type ParticipantBase = {
  type: ParticipantType,
  id: string,
  name: string,
}
export type Participant = GameMaster | Player;

export type Player = ParticipantBase &{
  type: ParticipantType.Player,
  picture: string,
  description: string,
  attributes:{
    bar: AttributeBar[];
    inventory: AttributeInventory[];
    status: AttributeStatus[];
  },
}


export type GameEvent = {
  /**
   * A unique identifier for this event.
   */
  id: string,
  /**
   * The id of the game session this event belongs to.
   */
  gameSessionId: GameSession['id'],
  /**
   * The type of event (e.g., 'action', 'dice-roll', 'narrative', 'combat', etc.)
   */
  type: string,
  /**
   * The participant who triggered this event (can be a player or game master).
   */
  participantId: Participant['id'],
  /**
   * The participant's name at the time of the event.
   */
  participantName: string,
  /**
   * The title or short description of the event.
   */
  title: string,
  /**
   * Detailed description of what happened.
   */
  description: string,
  /**
   * Timestamp when the event occurred.
   */
  timestamp: number,
  /**
   * Optional metadata for the event (dice results, affected players, etc.)
   */
  metadata?: Record<string, unknown>,
}
