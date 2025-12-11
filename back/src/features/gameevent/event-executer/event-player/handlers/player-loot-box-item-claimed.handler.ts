import { EventPlayerLootBoxItemClaimed } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';
import { assertPlayerExists } from '../event-player.executer';

export const playerLootBoxItemClaimedHandler: GameEventHandlerFn<EventPlayerLootBoxItemClaimed> = (event, gameSession, currentParticipantId) => {
  const player = assertPlayerExists(gameSession, event.playerId);

  // Validate that the current participant is either the player themselves or the GM
  const isGameMaster = currentParticipantId === gameSession.master.id;
  const isTargetPlayer = currentParticipantId === event.playerId;
  
  if (!isGameMaster && !isTargetPlayer) {
    throw new Error('Only the player themselves or the GM can claim loot box items');
  }

  // Find the first non-secret, weight-based inventory
  const claimableInventory = player.attributes.inventory.find(inv => 
    !inv.isSecret && 
    inv.capacity.type === 'weight'
  );

  if (!claimableInventory) {
    throw new Error('Player has no available inventory to claim items');
  }

  // Note: The actual item addition and loot box event update will be handled
  // in the game event controller after this handler validates the claim.
  
  return gameSession;
};
