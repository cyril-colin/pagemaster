import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from '../pages/game-instance-session/auth.guard';
import { GameInstanceSessionComponent } from '../pages/game-instance-session/game-instance-session.component';
import { GameInstancePageComponent } from '../pages/game-instance-session/game-instance.page.component';
import { PlayerPageComponent } from '../pages/game-instance-session/player.page.component';
import { GameDefNewComponent } from '../pages/public/game-def-new.component';
import { GameInstanceConfigComponent } from '../pages/public/game-instance-creation/game-instance-config.component';
import { GameInstanceSelectComponent } from '../pages/public/game-instance-creation/game-instance-select.component';
import { GameInstanceJoinComponent } from '../pages/public/game-instance-join.component';
import { GameInstanceLoadComponent } from '../pages/public/game-instance-load.component';
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
    GameInstanceJoin: { path: 'game-instance/join', component: GameInstanceJoinComponent },
    GameInstanceLoad: { path: 'game-instance/load', component: GameInstanceLoadComponent },
    GameInstanceSessionPlayer: ((params= ['instanceId', 'playerId'] as const,
      path = `game-instance/sessions/:${params[0]}/player/:${params[1]}`) => ({
      path,
      params,
      interpolated: (id: string, playerId: string) => path.replace(`:${params[0]}`, id).replace(`:${params[1]}`, playerId),
      component: PlayerPageComponent,
      canActivate: [((route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        return inject(AuthGuard).canActivate(route, state);
      })] satisfies CanActivateFn[],
    }))(),
    GameInstanceSession: ((params= ['instanceId'] as const, path = `game-instance/sessions/:${params[0]}`) => ({
      path,
      params,
      interpolated: (id: string) => path.replace(`:${params[0]}`, id),
      component: GameInstancePageComponent,
      canActivate: [((route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        return inject(AuthGuard).canActivate(route, state);
      })] satisfies CanActivateFn[],
      children: [
        { path: '', redirectTo: 'events', pathMatch: 'full' },
        { path: 'events', component: EventsCenterComponent },
      ],
    }))(),
    GameInstanceSessionTest: ((params= ['instanceId'] as const, path = `game-instance-tests/sessions/:${params[0]}`) => ({
      path,
      params,
      interpolated: (id: string) => path.replace(`:${params[0]}`, id),
      component: GameInstanceSessionComponent,
      canActivate: [((route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        return inject(AuthGuard).canActivate(route, state);
      })] satisfies CanActivateFn[],
    }))(),
    GameInstanceSessionChooseParticipant: ((
      params= ['instanceId'] as const,
      path = `game-instance/sessions/:${params[0]}/choose-participant`,
    ) => ({
      path,
      params,
      interpolated: (id: string) => path.replace(`:${params[0]}`, id),
      component: GameInstanceSessionChooseParticipantComponent,
    }))(),
    GameDefNew: { path: 'game-def/new', component: GameDefNewComponent },
  };
}