import { AttributeBar, AttributeInventory, AttributeStatus } from './attributes.types';

export type GameInstance = {
  /**
   * A unique identifier for this game instance.
   */
  readonly id: string,

  /**
   * The version of the game instance. This is incremented each time the game instance is updated.
   * This allows clients to know if they have the latest version of the game instance or not.
   * 
   * This is useful for optimistic concurrency control: when a client wants to update the game instance,
   * it can check if the version it has is the same as the version on the server. If not, it means
   * that someone else has updated the game instance in the meantime, and the client should fetch
   * the latest version before making its own updates.
   */
  version: number,

  /**
   * The name of the game master (the person who created this game instance).
   * Without spaces
   */
  readonly masterName: string,
  
  participants: Participant[],
};

/**
 * This defines a game event that occurred during a game instance.
 * Events are used to track the history of actions and occurrences in the game,
 * such as player actions, game master decisions, dice rolls, etc.
 */
export type GameEvent = {
  /**
   * A unique identifier for this event.
   */
  id: string,
  /**
   * The id of the game instance this event belongs to.
   */
  gameInstanceId: GameInstance['id'],
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
   * Optional metadata for the event (dice results, affected characters, etc.)
   */
  metadata?: Record<string, unknown>,
}


export type Participant = 
  | Player
  | GameMaster;
/**
 * This defines an IRL players, that have a character in the game.
 */
export type Player = AbstractParticipant & {
  type: 'player',
  /**
   * The position of the player in the turn order.
   */
  position: number,
  character: Character,
}

export type AbstractParticipant = {
  id: string,
  type: 'player' | 'gameMaster',
  /**
   * The actual name of the player playing the game.
   * Not the same as the {@link Character.name}!
   * 
   * Should be unique across all players in the same {@link GameInstance}.
   */
  name: string,
}


export type GameMaster =  AbstractParticipant & {
  type: 'gameMaster',
}

/**
 * An in-game character, controlled by a player. It is owned by a only one
 * {@link Participant}. 
 */
export type Character = {
  id: string,
  picture: string,
  /**
   * Should be unique across all players in the same {@link GameInstance}.
   */
  name: string,
  description: string,
  attributes:{
    bar: AttributeBar[];
    inventory: AttributeInventory[];
    status: AttributeStatus[];
  },
}

