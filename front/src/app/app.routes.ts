import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { EventsCenterStateService } from './core/events-center/events-center.state';
import { CustomRoutes } from './core/router/custom-routes';
import { convertToAngularRoutes } from './core/router/route-parser';
import { authGuard } from './pages/game-session/auth.guard';
import { GameSessionPageComponent } from './pages/game-session/page-game-session/game-session.page.component';
import { NotesPageComponent } from './pages/game-session/page-game-session/page-current-notes/notes.page.component';
import { EventsCenterComponent } from './pages/game-session/page-game-session/page-history/events-center.component';
import { PlayerLayoutComponent } from './pages/game-session/page-game-session/page-player/player-layout.component';
import { PlayerListPageComponent } from './pages/game-session/page-game-session/page-players/player-list.page.component';
import { GameSessionConfigComponent } from './pages/public/game-session-creation/game-session-config.component';
import { HomeComponent } from './pages/public/home.component';
import { LobbyComponent } from './pages/public/lobby.component';
import { PublicLayoutComponent } from './pages/public/public-layout.component';



export const SmartRoutes = {
  default: {
    path: () => [''],
    redirectTo: 'home',
    pathMatch: 'full',
  },
  appHome: {
    path: () => ['home'],
    component: HomeComponent,
  },
  publicLayout: {
    path: () => [''],
    component: PublicLayoutComponent,
    children: {
      config: {
        path: () => ['game-session', 'config'],
        component: GameSessionConfigComponent,
      },
      lobby: {
        path: (p1 = ':instanceId') => ['game-session', 'sessions', p1, 'choose-participant'],
        component: LobbyComponent,
      },
    },
  },
  gameInstanceSession: {
    path: (p1 = ':instanceId') => ['game-session', 'sessions', p1],
    component: GameSessionPageComponent,
    canActivate: [
      authGuard,
      () => inject(EventsCenterStateService).init(),
    ],
    children: {
      defaultRoute: {
        path: () => [''],
        redirectTo: 'events',
        pathMatch: 'full',
      },
      events: {
        path: () => ['events'],
        component: EventsCenterComponent,
      },
      players: {
        path: () => ['players'],
        component: PlayerListPageComponent,
      },
      playerLayout: {
        path: (p1 = ':playerId', p2 = ':tabId') => ['players', p1, p2],
        component: PlayerLayoutComponent,
      },
      notes: {
        path: () => ['notes'],
        component: NotesPageComponent,
      },
    },
  },
} satisfies CustomRoutes;

export const routes: Routes = convertToAngularRoutes(SmartRoutes);