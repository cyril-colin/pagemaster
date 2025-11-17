import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PictureGalleryComponent } from '../../gallery/picture-gallery.component';
import { ModalRef, ModalService } from '../../modal';
import { ResourcePacksStorage } from '../../resource-packs-storage.service';
import { AvatarViewComponent } from './avatar-view.component';

export type AvatarPermissions = {
  edit: boolean,
};

export type AvatarEvent = {
  picture: string,
  modalRef: ModalRef<PictureGalleryComponent>,
}

@Component({
  selector: 'app-picture-control',
  template: `
    <app-avatar-view 
      [source]="picture()" 
      [permissions]="permissions()"
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
export class PictureControlComponent {
  public picture = input<string>('');
  public permissions = input.required<AvatarPermissions>();
  public newPicture = output<AvatarEvent>();
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
      this.newPicture.emit({ picture: newPicture.path, modalRef });
    });
  }
}