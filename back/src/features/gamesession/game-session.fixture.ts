
import { LoggerService } from '../../core/logger.service';
import { defaultBar, defaultInventories } from '../../pagemaster-schemas/src/attributes.types';
import { GameSession, ParticipantType } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameSessionMongoClient } from './game-session.mongo-client';

const defaultGameSession: GameSession = {
  "id": "post-apocalypse-v1-Cyril-1758352912606",
  "title": "Wasteland Survivors",
  "version": 1,
  "quickValues": {
    "statuses": [
      {
        id: "status-radiation-sickness",
        name: "☢️ Radiation",
        description: "",
        type: "status",
        color: "#a13401ff",
      },
      {
        id: "status-infection",
        name: "🦠 Infection",
        description: "",
        type: "status",
        color: "#678f3dff",
      },
      {
        id: "status-bleeding",
        name: "🩸 Bleeding",
        description: "",
        type: "status",
        color: "#b30303ff",
      },
      {
        id: "status-fracture",
        name: "🦴 Fracture",
        description: "",
        type: "status",
        color: "#ffc800ff",
      },
      {
        id: "status-fatigue",
        name: "😴 Fatigue",
        description: "",
        type: "status",
        color: "#0050ffff",
      }
    ],
    "bars": [
      defaultBar.health,
      defaultBar.stamina,
      defaultBar.mana,
      defaultBar.ammo,
    ]
  },
  master: {
    "id": ParticipantType.GameMaster,
    "type": ParticipantType.GameMaster,
    "name": "Overseer",
    "description": "The all-seeing coordinator of the wasteland, guiding survivors through the harsh realities of the post-apocalyptic world."
  },
  "players": [
    {
      "type": ParticipantType.Player,
        "id": "Razor-1759075666828",
        "name": "Razor",
        "description": "A brutal scavenger from the irradiated Dead Zones, wielding dual machetes with deadly precision. Years of surviving radiation storms have made him naturally resistant to the wasteland's harsh environment.\n\n- 🔪 Dual machetes\n- 💪 Melee combat\n- ☢️ Radiation resistant\n- 🏜️ Dead Zone survivor",
        "avatar": "/post-apo/avatars/desert_nomad.png",
        "attributes": {
          "bar": [
            defaultBar.health,
            defaultBar.stamina,
          ],
          "status": [],
          "inventory": Object.values(defaultInventories),
        },
      },
    {
      "type": ParticipantType.Player,
        "id": "Doc-1758931870753",
        "name": "Doc",
        "description": "A 67-year-old pre-war scientist who survived the Fall with invaluable knowledge of old-world technology. His expertise in repairing ancient tech has brought power back to three wasteland settlements.\n\n- 🧪 Tech repair\n- 📚 Old-world knowledge\n- 💬 Negotiation\n- ⚡ Power restoration",
        "avatar": "/post-apo/avatars/mutant_scout.png",
        "attributes": {
          "bar": [
            defaultBar.health,
            defaultBar.mana,
          ],
          "status": [],
          "inventory": Object.values(defaultInventories),
        },
      },
    {
      "type": ParticipantType.Player,
        "id": "Tank-1758931889802",
        "name": "Tank",
        "description": "Former military sergeant who survived the nuclear fallout in a bunker complex, now clad in reinforced riot armor. Specializes in breaking through fortifications with his modified pre-war sledgehammer.\n\n- 🔨 Heavy weapons\n- 💥 Breach specialist\n- 🛡️ Riot armor\n- 🪖 Military tactics",
        "avatar": "/post-apo/avatars/raider_leader.png",
        "attributes": {
          "bar": [
            defaultBar.health,
            defaultBar.stamina,
          ],
          "status": [],
          "inventory": Object.values(defaultInventories),
        },
      },
    {
      "type": ParticipantType.Player,
        "id": "Phoenix-1758931932742",
        "name": "Phoenix",
        "description": "A skilled field medic trained in both pre-war medicine and wasteland herbal remedies. Her ability to treat radiation sickness and stabilize critical injuries has saved countless lives across the settlements.\n\n- 💉 Advanced first aid\n- 🌿 Herbal medicine\n- ☢️ Radiation treatment\n- ⚕️ Critical care",
        "avatar": "/post-apo/avatars/rebel_engineer.png",
        "attributes": {
          "bar": [
            defaultBar.health,
            defaultBar.mana,
          ],
          "status": [],
          "inventory": Object.values(defaultInventories),
        },
      }
  ]
}

export class GameSessionFixture {
  constructor(
    private logger: LoggerService,
    private mongoClient: GameSessionMongoClient,
  ) {}

  public async initFirstGameSession(): Promise<void> {
    const existing = await this.mongoClient.findGameSessionById(defaultGameSession.id);
    if (existing) {
      this.logger.info(`Default GameSession with id '${defaultGameSession.id}' already exists. Skipping creation.`);
      return;
    }
    this.logger.info(`Default GameSession with id '${defaultGameSession.id}' does not exist. Creating new GameSession.`);
    await this.mongoClient.createGameSession(defaultGameSession);
  }
}
