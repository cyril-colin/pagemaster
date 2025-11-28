# PageMaster - User Features

This document lists the main features available to end users in the PageMaster application, based on the README and the frontend source code.

## Core Features

- **Real-time Game State Sync**
  - All player and game master actions are instantly synchronized across all connected devices using Socket.IO.

- **Mobile-first, Browser-based UI**
  - Designed for fast access and usability on mobile devices, no app installation required.

- **Game Session Management**
  - Create new game sessions and configure game master profile.
  - Import/export game sessions as JSON files for backup or transfer.
  - View and continue existing game sessions.

- **Participant Management**
  - Join a session as a player or game master.
  - Game master can add or remove players.
  - Players can view their own and other players' public attributes.

- **Player Profile & Attributes**
  - Edit player name, avatar, and description (with permissions).
  - Manage HP and other custom bars (add, edit, delete, update values).
  - Manage statuses (add, edit, delete).
  - Manage inventories (add, edit, delete inventories and items).

- **Dice Rolling**
  - Roll dice (d6, d20) directly from the interface.
  - Dice roll results are broadcast as events to all participants.

- **Event Center**
  - View a chronological list of all game events (dice rolls, inventory changes, status updates, etc.).

- **Session Navigation**
  - Swipe between player profiles for quick access (mobile gesture support).
  - Quick navigation between home, session, and participant pages.

- **Role-based Permissions**
  - Game master has full control over all players and session attributes.
  - Players have limited permissions (e.g., can edit their own description).

- **Notes & Descriptions**
  - Players can take notes in their own description field.

- **Sharing & Collaboration**
  - Share session links with players to join games easily.

## UI Features

- Modern, responsive design with cards, buttons, and divider components.
- Easy-to-use menus for session and participant management.
- Visual feedback for actions (e.g., dice rolls, player changes).

---

This list is based on the current implementation and may evolve as new features are added.
