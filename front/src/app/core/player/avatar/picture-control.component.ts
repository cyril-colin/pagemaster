import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { EventPlayerAvatarEdit, EventPlayerTypes } from '@pagemaster/common/events-player.types';
import { tap } from 'rxjs';
import { PictureGalleryComponent } from '../../gallery/picture-gallery.component';
import { ModalService } from '../../modal';
import { ResourcePacksStorage } from '../../resource-packs-storage.service';
import { AbstractPlayerControl } from '../abstract-player-control';
import { AvatarViewComponent } from './avatar-view.component';

@Component({
  selector: 'app-picture-control',
  template: `
    <app-avatar-view 
      [player]="player()" 
      [permissions]="permissions().avatar"
      (needSrc)="modalGallery()"
    />
  `,
  styles: [
    '',
  ],
  imports: [
    AvatarViewComponent,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PictureControlComponent extends AbstractPlayerControl {
  
  protected resourcePackStorage = inject(ResourcePacksStorage);
  protected pictures = computed(() => {
    const packs = this.resourcePackStorage.resourcePacks();
    const data = packs.flatMap(pack =>
      pack.avatars.models.map(model => ({ name: model.name, path: model.path })),
    );
    return data;
  });

  protected modalService = inject(ModalService);
  public modalGallery() {
    const modalRef = this.modalService.open(PictureGalleryComponent, { items: this.pictures() });
    modalRef.componentRef.instance.itemSelected.subscribe((newPicture: { name: string, path: string }) => {
      this.updateAvatar(newPicture.path).pipe(
        tap(() => void modalRef.close()),
      ).subscribe();
    });
  }

  protected updateAvatar(newAvatar: string) {
    const event = { ...this.prepareEvent(EventPlayerTypes.PLAYER_AVATAR_EDIT), newAvatar } as EventPlayerAvatarEdit;
    return this.gameEventRepository.postCommand(event);
  }
}