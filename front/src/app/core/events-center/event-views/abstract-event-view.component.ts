import { computed, Directive, inject, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventPlayerBase } from '@pagemaster/common/events.types';
import { CurrentGameSessionState } from '../../current-game-session.state';
import { PageMasterRoutes } from '../../pagemaster.router';

@Directive()
export abstract class AbstractEventViewComponent<T extends EventPlayerBase> {
  public event = input.required<T>();
  protected gameSession = inject(CurrentGameSessionState);
  protected player = computed(() => 
    this.gameSession.currentGameSession().players.find(p => p.id === this.event().playerId),
  );
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);

  protected playerUrl() {
    const urlTree = this.router.createUrlTree(
      ['..', PageMasterRoutes().GameInstanceSession.children[2].interpolated(this.player()?.id || '')],
      { relativeTo: this.route },
    );

    return decodeURIComponent(urlTree.toString());
  }
}