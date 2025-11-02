/**
 * REFACTORED - This file has been split into multiple controllers
 *
 * The original GameInstanceController was too large (1000+ lines) and handled multiple concerns.
 * It has been split into focused controllers, each handling a specific property/concern:
 *
 * CORE CONTROLLERS:
 * - GameInstanceController (game-instance-crud.controller.ts)
 *   Core CRUD operations for game instances, participants, and game instance items
 *
 * PARTICIPANT PROPERTY CONTROLLERS:
 * - ParticipantProfileController (participant-profile.controller.ts)
 *   Character profile: name, avatar, description
 *
 * - ParticipantBarsController (participant-bars.controller.ts)
 *   Character bars (health, mana, stamina, etc.)
 *
 * - ParticipantStatusesController (participant-statuses.controller.ts)
 *   Status effects (poisoned, blessed, etc.)
 *
 * - ParticipantStrengthsController (participant-strengths.controller.ts)
 *   Character strengths
 *
 * - ParticipantWeaknessesController (participant-weaknesses.controller.ts)
 *   Character weaknesses
 *
 * - ParticipantSkillsController (participant-skills.controller.ts)
 *   Character skills
 *
 * - ParticipantInventoryController (participant-inventory.controller.ts)
 *   Complete inventory management: items CRUD, inventory selection/unselection
 *
 * SERVICE (COMPOSITION OVER INHERITANCE):
 * - GameInstanceService (game-instance.service.ts)
 *   Shared business logic, validation, and helper methods used by all controllers
 *   Uses composition pattern instead of inheritance for better testability
 */

// Export the service
export { GameInstanceService } from './game-instance.service';

// Export all the split controllers
export { GameInstanceController } from './game-instance-crud.controller';
export { ParticipantBarsController } from './participant-bars.controller';
export { ParticipantInventoryController } from './participant-inventory.controller';
export { ParticipantProfileController } from './participant-profile.controller';
export { ParticipantSkillsController } from './participant-skills.controller';
export { ParticipantStatusesController } from './participant-statuses.controller';
export { ParticipantStrengthsController } from './participant-strengths.controller';
export { ParticipantWeaknessesController } from './participant-weaknesses.controller';

// Default export for backwards compatibility
import { GameInstanceController } from './game-instance-crud.controller';
export default GameInstanceController;