import { Character, Participant } from './pagemaster.types'

export type EventBase = {
  type: string,
  gameSessionId: string,
  timestamp: number,
}

export type EventCharacterBase = EventBase & {
  type: EventCharacterBase,
  characterId: string,
}


/**
 * The event that will be saved, with participant and character info populated.
 */
export type EventCharacterComputed<T extends EventCharacterBase> = T & {
  triggerer: Participant,
  targetCharacter: Character,
}

