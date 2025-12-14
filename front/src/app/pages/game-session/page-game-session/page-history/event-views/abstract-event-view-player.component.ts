import { computed, Directive, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventPlayerBase } from '@pagemaster/common/events.types';
import { SmartRoutes } from 'src/app/app.routes';
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
      [
        '..',
        ...SmartRoutes.gameInstanceSession.children.playerLayout.path(
          this.player()?.id || '',
          'details',
        ),
      ],
      { relativeTo: this.route },
    );

    return decodeURIComponent(urlTree.toString());
  }
}