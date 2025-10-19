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
import { GameDefService } from './core/repositories/gamedef.service';

export const WINDOW = new InjectionToken<Window>('WindowToken');
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),

    provideHttpClient(withInterceptors([currentParticipantInterceptor])),
    { provide: WINDOW, useValue: window },
    provideAppInitializer(appInitializer),
    GameDefService,
  ],
};
