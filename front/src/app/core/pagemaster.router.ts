import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Route, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from '../pages/game-instance-session/auth.guard';
import { GameInstancePageComponent } from '../pages/game-instance-session/game-instance.page.component';
import { PlayerPageComponent } from '../pages/game-instance-session/player.page.component';
import { GameInstanceConfigComponent } from '../pages/public/game-instance-creation/game-instance-config.component';
import { GameInstanceSelectComponent } from '../pages/public/game-instance-creation/game-instance-select.component';
import { GameInstanceSessionChooseParticipantComponent } from '../pages/public/game-instance-session-choose-participant.component';
import { HomeComponent } from '../pages/public/home.component';
import { EventsCenterComponent } from './events-center/events-center.component';

export function PageMasterRoutes() {
  return {
    Home: { path: 'home', component: HomeComponent },
    GameInstanceSelect: { path: 'game-instance/select', component: GameInstanceSelectComponent },
    GameInstanceConfig: ((params= ['instanceId'] as const,path = `game-instance/config/:${params[0]}`) => ({
      path,
      params,
      interpolated: (id: string) => path.replace(`:${params[0]}`, id),
      component: GameInstanceConfigComponent,
    }))(),
    GameInstanceSession: ((params= ['instanceId', 'playerId'] as const, path = `game-instance/sessions/:${params[0]}`) => {
      
      return ({
        path,
        params,
        interpolated: (id: string) => path.replace(`:${params[0]}`, id),
        component: GameInstancePageComponent,
        canActivate: [((route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
          return inject(AuthGuard).canActivate(route, state);
        })] satisfies CanActivateFn[],
        children: [
          { path: '', redirectTo: 'events', pathMatch: 'full' as const },
          { path: 'events', component: EventsCenterComponent },
          {
            path: `player/:${params[1]}`,
            interpolated: (playerId: string) => `player/:${params[1]}`.replace(`:${params[1]}`, playerId),
            component: PlayerPageComponent,
          },
        ] as const,
      });
    })(),
    GameInstanceSessionChooseParticipant: ((
      params= ['instanceId'] as const,
      path = `game-instance/sessions/:${params[0]}/choose-participant`,
    ) => ({
      path,
      params,
      interpolated: (id: string) => path.replace(`:${params[0]}`, id),
      component: GameInstanceSessionChooseParticipantComponent,
    }))(),
  } satisfies Record<string, Route>;
}