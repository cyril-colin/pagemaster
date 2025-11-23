import { EventPlayerTypes } from './events-player.types'

export type EventBase = {
  id: string,
  timestamp: number,
  type: string,
  gameSessionId: string,
}

export type EventPlayerBase = EventBase & {
  type: EventPlayerTypes,
  /**
   * The ID of the player this event is about.
   */
  playerId: string,
}

