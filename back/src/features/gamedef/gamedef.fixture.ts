import { LoggerService } from '../../core/logger.service';
import { PageMasterMongoClient } from '../../core/pagemaster-mongo-client';
import { GameDef } from '../../pagemaster-schemas/src/pagemaster.types';

const defaultGameDef: GameDef = {
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
}

export class GameDefFixture {
  constructor(
    private logger: LoggerService,
    private mongoClient: PageMasterMongoClient,
  ) {}

  public async initFirstGameDef(): Promise<void> {
    const existing = await this.mongoClient.findGameDefById(defaultGameDef.id);
    if (existing) {
      this.logger.info(`Default GameDef with id '${defaultGameDef.id}' already exists. Skipping creation.`);
      return;
    }
    this.logger.info(`Default GameDef with id '${defaultGameDef.id}' does not exist. Creating new GameDef.`);
    await this.mongoClient.createGameDef(defaultGameDef);
  }
}