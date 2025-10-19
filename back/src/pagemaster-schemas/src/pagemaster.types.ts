import { Attributes } from './attributes.types';
import { Item } from './items.types';
import { Skill, SkillInstance } from './skills.types';

/**
 * This defines a game definition, that can be used to create game instances.
 * 
 * A game definition allows you to define multiple game universes. For example 
 * you could have a "Medieval Fantasy" game definition, and a "Sci-Fi" game definition,
 * each with their own set of attributes, skills, and items.
 * The game definition itself is immutable: once created, it cannot be changed.
 * However, you can create multiple {@link GameInstance} based on the same game definition.
 */
export type GameDef = {
  id: string,
  name: string,
  version: string,
  description: string,
  minPlayers: number,
  maxPlayers: number,
  possibleAttributes: { [K in keyof Attributes]-?: Attributes[K]['definition'][];},
  possibleSkills: Skill[],
  possibleItems: Item[],
}


/**
 * This defines a specific instance of a game, based on a {@link GameDef}.
 * 
 * A game instance is created when a group of players decide which {@link GameDef} to play together.
 * It contains the state of the game, including the players and their characters.
 * 
 * A game instance is mutable: the state of the game can change over time,
 * as players progress through the game, gain new skills, acquire new items, etc.
 */
export type GameInstance = {
  /**
   * A unique identifier for this game instance.
   * Format is `${gameInstanceForm.gameDefId}-${gameInstanceForm.masterName}-${Date.now()}`
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
  /**
   * The id of the game definition this instance is based on.
   * Thanks to this, we can always retrieve the original game definition if needed.
   */
  readonly gameDefId: GameDef['id'],
  /**
   * The game definition this instance is based on.
   * This is here because during a game session, the game definition might change : we could
   * add new attributes, new items, new skills... but the game instance should remain the same.
   * That's why we keep {@link GameInstance.gameDefId} as a reference, in order to retrieve the original game definition
   * if needed.
   */
  gameDef: GameDef,
  
  participants: Participant[],
};

export type GameSession = {
  id: string,
  gameInstance: GameInstance,
  onlinePlayers: Participant['id'][],
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
    [K in keyof Attributes]-?: Attributes[K]['instance'][];
  },
  skills: SkillInstance[],
}

