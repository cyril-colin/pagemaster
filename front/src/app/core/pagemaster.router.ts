import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Route, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from '../pages/game-session/auth.guard';
import { GameSessionPageComponent } from '../pages/game-session/page-game-session/game-session.page.component';
import { NotesPageComponent } from '../pages/game-session/page-game-session/page-current-notes/notes.page.component';
import { EventsCenterComponent } from '../pages/game-session/page-game-session/page-history/events-center.component';
import { PlayerListPageComponent } from '../pages/game-session/page-game-session/page-players/player-list.page.component';
import { PlayerLayoutComponent } from '../pages/game-session/page-game-session/page-players/player/player-layout.component';
import { TabDetailsComponent } from '../pages/game-session/page-game-session/page-players/player/tab-details/tab-details.component';
import { TabInventoryComponent } from '../pages/game-session/page-game-session/page-players/player/tab-inventory/tab-inventory.component';
import { TabNotesComponent } from '../pages/game-session/page-game-session/page-players/player/tab-notes/tab-notes.component';
import { GameSessionChooseParticipantComponent } from '../pages/public/game-session-choose-participant.component';
import { GameSessionConfigComponent } from '../pages/public/game-session-creation/game-session-config.component';
import { HomeComponent } from '../pages/public/home.component';
import { PublicLayoutComponent } from '../pages/public/public-layout.component';
import { EventsCenterStateService } from './events-center/events-center.state';

export const RouteParamsNames = {
  InstanceId: 'instanceId',
  PlayerId: 'playerId',
};

export function PageMasterRoutes() {
  return {
    Home: { path: 'home', component: HomeComponent },
    PublicPages: {
      path: '',
      component: PublicLayoutComponent,
      children: [
        ((params= ['instanceId'] as const,path = 'game-session/config') => ({
          path,
          params,
          interpolated: (id: string) => path.replace(`:${params[0]}`, id),
          component: GameSessionConfigComponent,
        }))(),
        ((
          params= ['instanceId'] as const,
          path = `game-session/sessions/:${params[0]}/choose-participant`,
        ) => ({
          path,
          params,
          interpolated: (id: string) => path.replace(`:${params[0]}`, id),
          component: GameSessionChooseParticipantComponent,
        }))(),
      ],
    },
    GameInstanceConfig: ((params= ['instanceId'] as const,path = `game-session/config/:${params[0]}`) => ({
      path,
      params,
      interpolated: (id: string) => path.replace(`:${params[0]}`, id),
      component: GameSessionConfigComponent,
    }))(),
    GameInstanceSession: ((params= ['instanceId', 'playerId'] as const, path = `game-session/sessions/:${params[0]}`) => {
      
      return ({
        path,
        params,
        interpolated: (id: string) => path.replace(`:${params[0]}`, id),
        component: GameSessionPageComponent,
        canActivate: [
          (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
            return inject(AuthGuard).canActivate(route, state);
          },
          () => {
            return inject(EventsCenterStateService).init();
          },
        ],
        children: [
          { path: '', redirectTo: 'events', pathMatch: 'full' as const },
          { path: 'events', component: EventsCenterComponent },
          { path: 'player', component: PlayerListPageComponent },
          {
            path: `player/:${params[1]}`,
            interpolated: (playerId: string) => `player/:${params[1]}`.replace(`:${params[1]}`, playerId),
            component: PlayerLayoutComponent,
            children: [
              { path: '', redirectTo: 'details', pathMatch: 'full' },
              { path: 'details', component: TabDetailsComponent },
              { path: 'notes', component: TabNotesComponent },
              { path: ':inventoryId', component: TabInventoryComponent },
            ],
          },
          {path: 'notes', component: NotesPageComponent},
        ] as const,
      });
    })(),
    GameInstanceSessionChooseParticipant: ((
      params= ['instanceId'] as const,
      path = `game-session/sessions/:${params[0]}/choose-participant`,
    ) => ({
      path,
      params,
      interpolated: (id: string) => path.replace(`:${params[0]}`, id),
      component: GameSessionChooseParticipantComponent,
    }))(),
  } satisfies Record<string, Route>;
}