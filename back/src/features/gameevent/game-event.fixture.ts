import { LoggerService } from '../../core/logger.service';
import { GameEvent } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameEventMongoClient } from './game-event.mongo-client';

const defaultGameEvents: GameEvent[] = [
  {
    id: "medieval-fantasy-v1-Cyril-1758352912606-event-1",
    gameInstanceId: "medieval-fantasy-v1-Cyril-1758352912606",
    type: "narrative",
    participantId: "gamemaster-Cyril",
    participantName: "Cyril",
    title: "The Adventure Begins",
    description: "Our heroes meet at the tavern in the small village of Oakshire, where rumors of a dragon in the nearby mountains have been spreading.",
    timestamp: 1758352912606,
    metadata: {
      location: "Oakshire Tavern"
    }
  },
  {
    id: "medieval-fantasy-v1-Cyril-1758352912606-event-2",
    gameInstanceId: "medieval-fantasy-v1-Cyril-1758352912606",
    type: "action",
    participantId: "player-Alain-0",
    participantName: "Alain",
    title: "Gorbakddd casts Fireball",
    description: "Gorbakddd unleashes a powerful fireball at the approaching goblin raiders!",
    timestamp: 1758353012606,
    metadata: {
      skill: "fireball",
      target: "goblin raiders"
    }
  },
  {
    id: "medieval-fantasy-v1-Cyril-1758352912606-event-3",
    gameInstanceId: "medieval-fantasy-v1-Cyril-1758352912606",
    type: "dice-roll",
    participantId: "player-Claude-1",
    participantName: "Claude",
    title: "Elrondsss attempts lockpicking",
    description: "Elrondsss attempts to pick the ancient lock on the treasure chest. Rolling for success...",
    timestamp: 1758353112606,
    metadata: {
      skill: "lockpicking",
      diceResult: 18,
      success: true
    }
  }
];

export class GameEventFixture {
  constructor(
    private logger: LoggerService,
    private mongoClient: GameEventMongoClient,
  ) {}

  public async initGameEvents(): Promise<void> {
    for (const event of defaultGameEvents) {
      const existing = await this.mongoClient.findGameEventById(event.id);
      if (existing) {
        this.logger.info(`GameEvent with id '${event.id}' already exists. Skipping creation.`);
        continue;
      }
      this.logger.info(`GameEvent with id '${event.id}' does not exist. Creating new GameEvent.`);
      await this.mongoClient.createGameEvent(event);
    }
  }
}
