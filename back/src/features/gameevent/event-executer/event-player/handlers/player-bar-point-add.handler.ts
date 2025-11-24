import { EventPlayerBarNotifyAdd } from "src/pagemaster-schemas/src/events-player.types";
import { GameSession } from "src/pagemaster-schemas/src/pagemaster.types";

export function playerBarPointAddHandler(event: EventPlayerBarNotifyAdd, session: GameSession): void {
  const player = session.players.find(p => p.id === event.playerId);
  if (!player) throw new Error('Player not found');
  const bar = player.attributes.bar.find(b => b.id === event.barId);
  if (!bar) throw new Error('Bar not found');
  bar.current += event.addedValue;
}
