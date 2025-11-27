import { EventPlayerBarNotifyAdd } from "src/pagemaster-schemas/src/events-player.types";
import { GameSession } from "src/pagemaster-schemas/src/pagemaster.types";
import { assertAttributeIndex, assertGameMaster, assertPlayerExists } from "../event-player.executer";

export const playerBarPointAddHandler = (event: EventPlayerBarNotifyAdd, session: GameSession, currentParticipantId: string | null): void => {
  assertGameMaster(session, currentParticipantId);
  const player = assertPlayerExists(session, event.playerId);
  const barIndex = assertAttributeIndex(player, 'bar', event.barId);
  const bar = player.attributes.bar[barIndex];
  bar.current += event.addedValue;
}
