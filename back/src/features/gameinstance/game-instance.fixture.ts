import { LoggerService } from '../../core/logger.service';
import { GameInstance } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameInstanceMongoClient } from './game-instance.mongo-client';

const defaultGameInstance: GameInstance = {
  "id": "medieval-fantasy-v1-Cyril-1758352912606",
  "masterName": "Cyril",
  "version": 1,
  "gameDefId": "medieval-fantasy-v1",
  "gameDef": {
    "id": "medieval-fantasy-v1",
    "name": "Medieval Fantasy Adventure",
    "version": "1.0.0",
    "description": "A classic medieval fantasy RPG with wizards, warriors, and mythical creatures.",
    "minPlayers": 2,
    "maxPlayers": 6,
    "possibleAttributes": {
      "inventory": [
        {
          "id": "backpack",
          "type": "inventory",
          "name": "Backpack",
          "capacity": {
            "type": "weight",
            "value": 0,
            "max": 12
          },
          "isSecret": false
        },
        {
          "id": "secret-pouch",
          "type": "inventory",
          "name": "Secret Pouch",
          "capacity": {
            "type": "state",
            "value": "empty"
          },
          "isSecret": true
        }
      ],
    },
    "possibleItems": []
  },
  "participants": [
    {
      "id": "player-Alain-0",
      "type": "player",
      "name": "Alain",
      "position": 0,
      "character": {
        "id": "Gorbakddd-1759075666828",
        "name": "Gorbakddd",
        "description": "aaaaaa",
        "picture": "/avatars/avatar2.png",
        "attributes": {
          "bar": [{
            "id": "health",
            "type": "bar",
            "color": "red",
            "name": "Health",
            "min": 0,
            "max": 100,
            "current": 85
          }],
          "status": [],
          "inventory": [
            {
              "id": "backpack",
              "current": []
            },
            {
              "id": "secret-pouch",
              "current": []
            }
          ],
        },
      }
    },
    {
      "id": "player-Claude-1",
      "type": "player",
      "name": "Claude",
      "position": 1,
      "character": {
        "id": "Elrondsss-1758931870753",
        "name": "Elrondsss",
        "description": "Un super eqqqqqq",
        "picture": "/avatars/avatar1.png",
        "attributes": {
          "bar": [],
          "status": [],
          "inventory": [],
        },
      }
    },
    {
      "id": "player-Natasha-2",
      "type": "player",
      "name": "Natasha",
      "position": 2,
      "character": {
        "id": "Gimli-1758931889802",
        "name": "Gimli",
        "description": "yyyy",
        "picture": "/avatars/avatar6.png",
        "attributes": {
          "bar": [],
          "status": [],
          "inventory": [],
        },
      }
    },
    {
      "id": "player-Ginette-3",
      "type": "player",
      "name": "Ginette",
      "position": 3,
      "character": {
        "id": "Arwen-1758931932742",
        "name": "Arwen",
        "description": "zzzzzz",
        "picture": "/avatars/avatar1.png",
        "attributes": {
          "bar": [],
          "status": [],
          "inventory": [],
        },
      }
    },
    {
      "id": "gamemaster-Cyril",
      "type": "gameMaster",
      "name": "Cyril"
    }
  ]
}

export class GameInstanceFixture {
  constructor(
    private logger: LoggerService,
    private mongoClient: GameInstanceMongoClient,
  ) {}

  public async initFirstGameInstance(): Promise<void> {
    const existing = await this.mongoClient.findGameInstanceById(defaultGameInstance.id);
    if (existing) {
      this.logger.info(`Default GameInstance with id '${defaultGameInstance.id}' already exists. Skipping creation.`);
      return;
    }
    this.logger.info(`Default GameInstance with id '${defaultGameInstance.id}' does not exist. Creating new GameInstance.`);
    await this.mongoClient.createGameInstance(defaultGameInstance);
  }
}
