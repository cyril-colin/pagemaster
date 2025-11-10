import {
  ApplicationConfig,
  InjectionToken,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { appInitializer } from './core/app.initializer';
import { currentParticipantInterceptor } from './core/repositories/current-participant.interceptor';
import { GameDefRepository } from './core/repositories/gamedef.repository';

export const WINDOW = new InjectionToken<Window>('WindowToken');
export const HISTORY = new InjectionToken<History>('HistoryToken');
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),

    provideHttpClient(withInterceptors([currentParticipantInterceptor])),
    { provide: WINDOW, useValue: window },
    { provide: HISTORY, useValue: window.history },
    provideAppInitializer(appInitializer),
    GameDefRepository,
  ],
};
