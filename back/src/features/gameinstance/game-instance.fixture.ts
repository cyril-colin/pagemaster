import { LoggerService } from '../../core/logger.service';
import { PageMasterMongoClient } from '../../core/pagemaster-mongo-client';
import { GameInstance } from '../../pagemaster-schemas/src/pagemaster.types';

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
      "bar": [
        {
          "id": "health",
          "type": "bar",
          "color": "#ff0000",
          "name": "Health Points",
          "min": 0,
          "max": 100
        },
        {
          "id": "mana",
          "type": "bar",
          "color": "#0000ff",
          "name": "Mana Points",
          "min": 0,
          "max": 50
        }
      ],
      "status": [
        {
          "id": "poisoned",
          "type": "status",
          "color": "#00ff00",
          "name": "Poisoned",
          "description": "Character is suffering from poison damage over time"
        },
        {
          "id": "blessed",
          "type": "status",
          "color": "#ffff00",
          "name": "Blessed",
          "description": "Character has divine protection and enhanced abilities"
        }
      ],
      "inventory": [
        {
          "id": "backpack",
          "type": "inventory",
          "name": "Backpack",
          "capacity": {
            "type": "weight",
            "value": 0,
            "max": 50
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
      "strength": [
        {
          "id": "combat-expertise",
          "type": "strength",
          "name": "Combat Expertise"
        },
        {
          "id": "magical-affinity",
          "type": "strength",
          "name": "Magical Affinity"
        }
      ],
      "weakness": [
        {
          "id": "fear-of-darkness",
          "type": "weakness",
          "name": "Fear of Darkness"
        },
        {
          "id": "claustrophobia",
          "type": "weakness",
          "name": "Claustrophobia"
        }
      ]
    },
    "possibleSkills": [
      {
        "id": "lockpicking",
        "name": "Lockpicking",
        "description": "Ability to pick locks and bypass mechanical security",
        "picture": "lockpick_icon.png"
      },
      {
        "id": "fireball",
        "name": "Fireball",
        "description": "Cast a powerful fireball spell to damage enemies",
        "picture": "fireball_icon.png"
      },
      {
        "id": "stealth",
        "name": "Stealth",
        "description": "Move silently and remain hidden from enemies",
        "picture": "stealth_icon.png"
      },
      {
        "id": "healing",
        "name": "Healing",
        "description": "Restore health to yourself or allies",
        "picture": "healing_icon.png"
      }
    ],
    "possibleItems": [
      {
        "id": "iron-sword",
        "picture": "iron_sword.png",
        "name": "Iron Sword",
        "description": "A sturdy iron sword with a sharp blade",
        "weight": 3.5
      },
      {
        "id": "health-potion",
        "picture": "health_potion.png",
        "name": "Health Potion",
        "description": "A red potion that restores 25 health points",
        "weight": 0.5
      },
      {
        "id": "magic-staff",
        "picture": "magic_staff.png",
        "name": "Magic Staff",
        "description": "A wooden staff imbued with magical energy",
        "weight": 2
      },
      {
        "id": "leather-armor",
        "picture": "leather_armor.png",
        "name": "Leather Armor",
        "description": "Light armor made of tanned leather",
        "weight": 8
      },
      {
        "id": "Sword",
        "picture": "sword.png",
        "name": "Narzil",
        "description": "woaaaaah",
        "weight": 0.3
      },
      {
        "id": "aaaaa",
        "picture": "aaaaa",
        "name": "aaaa",
        "description": "aaaa",
        "weight": 0.3
      },
      {
        "id": "eeeee",
        "picture": "eeeee",
        "name": "eeee",
        "description": "eeee",
        "weight": 0.6
      }
    ]
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
          "bar": [
            {
              "id": "health",
              "current": 15
            },
            {
              "id": "mana",
              "current": 5
            }
          ],
          "status": [
            {
              "id": "poisoned",
              "current": ""
            }
          ],
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
          "strength": [
            {
              "id": "combat-expertise"
            }
          ],
          "weakness": [
            {
              "id": "fear-of-darkness"
            }
          ]
        },
        "skills": [
          {
            "id": "fireball"
          },
          {
            "id": "fireball"
          },
          {
            "id": "fireball"
          }
        ]
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
          "bar": [
            {
              "id": "health",
              "current": 75
            },
            {
              "id": "mana",
              "current": 24
            }
          ],
          "status": [
            {
              "id": "poisoned",
              "current": ""
            },
            {
              "id": "blessed",
              "current": ""
            }
          ],
          "inventory": [],
          "strength": [],
          "weakness": []
        },
        "skills": [
          {
            "id": "lockpicking"
          },
          {
            "id": "fireball"
          },
          {
            "id": "stealth"
          },
          {
            "id": "healing"
          }
        ]
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
          "bar": [
            {
              "id": "health",
              "current": 70
            },
            {
              "id": "mana",
              "current": 42
            }
          ],
          "status": [],
          "inventory": [],
          "strength": [],
          "weakness": []
        },
        "skills": []
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
          "bar": [
            {
              "id": "health",
              "current": 88
            },
            {
              "id": "mana",
              "current": 50
            }
          ],
          "status": [],
          "inventory": [],
          "strength": [],
          "weakness": []
        },
        "skills": []
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
    private mongoClient: PageMasterMongoClient,
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
