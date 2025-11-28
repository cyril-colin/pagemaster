import { computed, Directive, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventPlayerBase } from '@pagemaster/common/events.types';
import { PageMasterRoutes } from '../../pagemaster.router';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Directive()
export abstract class AbstractEventViewPlayerComponent<T extends EventPlayerBase> extends AbstractEventViewComponent<T> {
  protected player = computed(() => 
    this.gameSession.currentGameSession().players.find(p => p.id === this.event().event.playerId),
  );
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);

  protected playerUrl() {
    const urlTree = this.router.createUrlTree(
      ['..', PageMasterRoutes().GameInstanceSession.children[3].interpolated(this.player()?.id || '')],
      { relativeTo: this.route },
    );

    return decodeURIComponent(urlTree.toString());
  }
}