import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HEADER_CURRENT_PARTICIPANT } from '../../../pagemaster-schemas/src/constants';
import { CurrentSessionState } from '../current-session.state';

export const currentParticipantInterceptor: HttpInterceptorFn = (req, next) => {
  const currentSession = inject(CurrentSessionState);

  const newRequest = req.clone({
    headers: req.headers.append(HEADER_CURRENT_PARTICIPANT, currentSession.currentSessionNullable()?.participant.id ?? ''),
  });
  return next(newRequest);
};