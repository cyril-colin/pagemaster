
import { LoggerService } from '../../core/logger.service';
import { defaultBar, defaultInventories } from '../../pagemaster-schemas/src/attributes.types';
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
    "possibleItems": []
  },
  "participants": [
    {
      "id": "player-Alain-0",
      "type": "player",
      "name": "Alain",
      "position": 0,
      "character": {
        "id": "Gorbak-1759075666828",
        "name": "Gorbak",
        "description": "# Gorbak the Fierce\n\nA **mighty orc warrior** from the northern tribes.\n\n## Background\nGorbak was raised in the harsh *Frostpeak Mountains*, where only the strongest survive. He earned his title through countless battles.\n\n## Abilities\n- Master of **dual-wielding axes**\n- Unmatched strength in close combat\n- Natural resistance to cold\n\n> \"Fear is for the weak. I am Gorbak!\"",
        "picture": "/fantasy/avatars/orcs-farmer.png",
        "attributes": {
          "bar": [defaultBar.health, defaultBar.stamina],
          "status": [],
          "inventory": Object.values(defaultInventories),
        },
      }
    },
    {
      "id": "player-Claude-1",
      "type": "player",
      "name": "Claude",
      "position": 1,
      "character": {
        "id": "Elrond-1758931870753",
        "name": "Elrond",
        "description": "# Elrond the Wise\n\nA **wise elf lord** with vast knowledge of ancient lore.\n\n## Characteristics\n- Age: Over 3,000 years\n- Role: *Scholar and Keeper of Histories*\n- Specialty: **Arcane Magic** and Diplomacy\n\n## Notable Achievements\n1. Advisor to three elven kingdoms\n2. Master of the `Ancient Runes`\n3. Guardian of the Sacred Grove\n\n> \"Knowledge is the true power that transcends time.\"",
        "picture": "/fantasy/avatars/elfe-archer.png",
        "attributes": {
          "bar": [defaultBar.health, defaultBar.mana],
          "status": [],
          "inventory": Object.values(defaultInventories),
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
        "description": "# Gimli Ironbeard\n\nA **doughty dwarf warrior** wielding a legendary battle axe.\n\n## Heritage\nSon of Glóin, from the famous line of *Durin's Folk*. Born in the **Lonely Mountain**.\n\n## Combat Style\n- Primary Weapon: Two-handed battle axe\n- Defense: Heavy plate armor\n- Specialty: Breaking enemy formations\n\n### Equipment\n- `Ironbeard's Axe` (Family heirloom)\n- Mithril chainmail vest\n\n> \"You'll have to toss me... Don't tell the elf!\"",
        "picture": "/fantasy/avatars/dwarf-knight.png",
        "attributes": {
          "bar": [defaultBar.health, defaultBar.stamina],
          "status": [],
          "inventory": Object.values(defaultInventories),
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
        "description": "# Arwen Evenstar\n\nA **graceful elf princess** blessed with extraordinary healing powers.\n\n## Royal Lineage\nDaughter of Lord Elrond, bearer of the *Evenstar*. Her beauty and wisdom are legendary throughout the realms.\n\n## Magical Abilities\n- **Divine Healing**: Can restore life force\n- *Light Magic*: Banishes darkness and evil\n- Nature's Blessing: Commands plants and animals\n\n## Sacred Items\n1. The Evenstar pendant\n2. Staff of Moonlight\n3. Elven healing herbs\n\n> \"Even the smallest person can change the course of history.\"",
        "picture": "/fantasy/avatars/elf-girl.png",
        "attributes": {
          "bar": [defaultBar.health, defaultBar.mana],
          "status": [],
          "inventory": Object.values(defaultInventories),
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
