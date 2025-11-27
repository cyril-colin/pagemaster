import { Directive, inject, input } from '@angular/core';
import { EventBase } from '@pagemaster/common/events.types';
import { CurrentGameSessionState } from '../../current-game-session.state';
import { EventMeta } from '../events-center.state';

@Directive()
export abstract class AbstractEventViewComponent<T extends EventBase> {
  public event = input.required<EventMeta<T>>();
  protected gameSession = inject(CurrentGameSessionState);
}