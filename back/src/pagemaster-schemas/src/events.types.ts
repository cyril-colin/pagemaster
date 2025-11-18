import { EventPlayerTypes } from './events-player.types'
import { GameMaster, Player } from './pagemaster.types'

export type EventBase = {
  id?: string,
  type: string,
  gameSessionId: string,
}

export type EventPlayerBase = EventBase & {
  type: EventPlayerTypes,
  playerId: string,
}


/**
 * The event that will be saved, with participant and player info populated.
 */
export type EventPlayerComputed<T extends EventPlayerBase> = T & {
  triggerer: Player | GameMaster,
  targetPlayer: Player,
  timestamp: number,
}

