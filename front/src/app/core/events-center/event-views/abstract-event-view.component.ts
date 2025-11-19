import { Directive, input } from '@angular/core';
import { EventBase } from '@pagemaster/common/events.types';

@Directive()
export abstract class AbstractEventViewComponent<T extends EventBase> {
  public event = input.required<T>();
}