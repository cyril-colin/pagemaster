import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AVATAR_ICONS } from '../../gallery/item-icons.const';
import { PictureGalleryComponent } from '../../gallery/picture-gallery.component';
import { ModalRef, ModalService } from '../../modal';
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

  protected modalService = inject(ModalService);
  public modalGallery() {
    const modalRef = this.modalService.open(PictureGalleryComponent, { items: AVATAR_ICONS });
    modalRef.componentRef.instance.itemSelected.subscribe((newPicture: { name: string, path: string }) => {
      this.newPicture.emit({ picture: newPicture.path, modalRef });
    });
  }
}