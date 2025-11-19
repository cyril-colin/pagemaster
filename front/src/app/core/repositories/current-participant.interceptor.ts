import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HEADER_CURRENT_PARTICIPANT } from '@pagemaster/common/constants';
import { CurrentParticipantState } from '../current-participant.state';

export const currentParticipantInterceptor: HttpInterceptorFn = (req, next) => {
  const currentParticipant = inject(CurrentParticipantState);

  const newRequest = req.clone({
    headers: req.headers.append(HEADER_CURRENT_PARTICIPANT, currentParticipant.currentParticipantId() ?? ''),
  });
  return next(newRequest);
};