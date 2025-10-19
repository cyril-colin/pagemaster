/* eslint-disable no-undef */
// MongoDB initialization script
// This script runs when the container starts for the first time

// Create the main database
db = db.getSiblingDB('pagemaster');

// Create a user for the application
db.createUser({
  user: 'pagemaster-app',
  pwd: 'pagemaster-app-password',
  roles: [
    {
      role: 'readWrite',
      db: 'pagemaster'
    }
  ]
});

// Create collections with some initial structure (optional)
db.createCollection('gamedefs');
db.createCollection('gameinstances');
db.createCollection('gamesessions');

// Create indexes for better performance
db.gamedefs.createIndex({ "id": 1 }, { unique: true });
db.gamedefs.createIndex({ "name": 1 });
db.gamedefs.createIndex({ "version": 1 });

db.gameinstances.createIndex({ "gameDefId": 1 });
db.gameinstances.createIndex({ "gameDef.id": 1 });

db.gamesessions.createIndex({ "id": 1 }, { unique: true });
db.gamesessions.createIndex({ "gameInstance.gameDefId": 1 });

// Insert sample GameDef data
const sampleGameDef = {
  id: "medieval-fantasy-v1",
  name: "Medieval Fantasy Adventure",
  version: "1.0.0",
  description: "A classic medieval fantasy RPG with wizards, warriors, and mythical creatures.",
  minPlayers: 2,
  maxPlayers: 6,
  possibleAttributes: {
    bar: [
      {
        id: "health",
        type: "bar",
        color: "#ff0000",
        name: "Health Points",
        min: 0,
        max: 100
      },
      {
        id: "mana",
        type: "bar",
        color: "#0000ff",
        name: "Mana Points",
        min: 0,
        max: 50
      }
    ],
    status: [
      {
        id: "poisoned",
        type: "status",
        color: "#00ff00",
        name: "Poisoned",
        description: "Character is suffering from poison damage over time"
      },
      {
        id: "blessed",
        type: "status",
        color: "#ffff00",
        name: "Blessed",
        description: "Character has divine protection and enhanced abilities"
      }
    ],
    inventory: [
      {
        id: "backpack",
        type: "inventory",
        name: "Backpack",
        capacity: {
          type: "weight",
          value: 0,
          max: 50
        },
        isSecret: false
      },
      {
        id: "secret-pouch",
        type: "inventory",
        name: "Secret Pouch",
        capacity: {
          type: "state",
          value: "empty"
        },
        isSecret: true
      }
    ],
    strength: [
      {
        id: "combat-expertise",
        type: "strength",
        name: "Combat Expertise"
      },
      {
        id: "magical-affinity",
        type: "strength",
        name: "Magical Affinity"
      }
    ],
    weakness: [
      {
        id: "fear-of-darkness",
        type: "weakness",
        name: "Fear of Darkness"
      },
      {
        id: "claustrophobia",
        type: "weakness",
        name: "Claustrophobia"
      }
    ]
  },
  possibleSkills: [
    {
      id: "lockpicking",
      name: "Lockpicking",
      description: "Ability to pick locks and bypass mechanical security",
      picture: "lockpick_icon.png"
    },
    {
      id: "fireball",
      name: "Fireball",
      description: "Cast a powerful fireball spell to damage enemies",
      picture: "fireball_icon.png"
    },
    {
      id: "stealth",
      name: "Stealth",
      description: "Move silently and remain hidden from enemies",
      picture: "stealth_icon.png"
    },
    {
      id: "healing",
      name: "Healing",
      description: "Restore health to yourself or allies",
      picture: "healing_icon.png"
    }
  ],
  possibleItems: [
    {
      id: "iron-sword",
      picture: "iron_sword.png",
      name: "Iron Sword",
      description: "A sturdy iron sword with a sharp blade",
      weight: 3.5
    },
    {
      id: "health-potion",
      picture: "health_potion.png",
      name: "Health Potion",
      description: "A red potion that restores 25 health points",
      weight: 0.5
    },
    {
      id: "magic-staff",
      picture: "magic_staff.png",
      name: "Magic Staff",
      description: "A wooden staff imbued with magical energy",
      weight: 2.0
    },
    {
      id: "leather-armor",
      picture: "leather_armor.png",
      name: "Leather Armor",
      description: "Light armor made of tanned leather",
      weight: 8.0
    }
  ]
};

db.gamedefs.insertOne(sampleGameDef);

// Insert sample GameInstance data
const sampleGameInstance = {
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
              "current": [
                {
                  "id": "Armue orc"
                }
              ]
            },
            {
              "id": "secret-pouch",
              "current": [
                {
                  "id": "knife"
                }
              ]
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
  ],
  "items": [
    {
      "id": "aaaaa",
      "picture": "aaaa",
      "name": "aaaa",
      "description": "aaaa",
      "weight": 0.4
    }
  ]
};

db.gameinstances.insertOne(sampleGameInstance);

// Insert sample GameSession data
const sampleGameSession = {
  id: "session-medieval-001",
  gameInstance: sampleGameInstance,
  onlinePlayers: ["player-1", "player-2"]
};

db.gamesessions.insertOne(sampleGameSession);

print('Database initialization completed successfully!');
print('Inserted sample data:');
print('- 1 GameDef: Medieval Fantasy Adventure');
print('- 1 GameInstance with 2 players');
print('- 1 GameSession with both players online');
