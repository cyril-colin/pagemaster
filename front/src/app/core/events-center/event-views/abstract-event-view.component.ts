import { Directive, inject, input } from '@angular/core';
import { EventBase } from '@pagemaster/common/events.types';
import { CurrentGameSessionState } from '../../current-game-session.state';

@Directive()
export abstract class AbstractEventViewComponent<T extends EventBase> {
  public event = input.required<T>();
  protected gameSession = inject(CurrentGameSessionState);
}