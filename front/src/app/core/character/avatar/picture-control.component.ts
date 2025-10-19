import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AVATAR_ICONS } from '../../gallery/item-icons.const';
import { PictureGalleryComponent } from '../../gallery/picture-gallery.component';
import { AvatarViewComponent } from './avatar-view.component';


@Component({
  selector: 'app-picture-control',
  template: `
    @if(this.mode() === 'view') {
      <app-avatar-view [source]="pictureForm().controls.picture.value" (needSrc)="setMode('edit')"/>
    } @else {
      <app-picture-gallery [items]="avatarList" (itemSelected)="setNewPicture($event)"/>
    }
  `,
  styles: [
    `img {
      width: 100px;
      height: 100px;
      object-fit: cover;
      cursor: pointer;
    }`,
  ],
  imports: [
    AvatarViewComponent,
    ReactiveFormsModule,
    PictureGalleryComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PictureControlComponent {
  protected avatarList = AVATAR_ICONS;
  public picture = input<string>('');
  public newPicture = output<{value: string}>();
  protected input = viewChild.required('input', { read: ElementRef<HTMLInputElement> });
  protected mode = signal<'view' | 'edit'>('view');
  protected fb = inject(FormBuilder);
  protected pictureForm = signal(this.createForm(this.picture()));
  protected availablePictures = Array.from({ length: 12 }, (_, index) => `/avatars/avatar${index + 1}.png`);
  

  constructor() {
    effect(() => {
      this.pictureForm().controls.picture.setValue(this.picture());
    });
  }

  private createForm(picture: string) {
    return this.fb.group({ picture: this.fb.control(picture, {nonNullable: true}) });
  }

  protected setNewPicture(newPicture: { name: string, path: string }): void {
    this.pictureForm().controls.picture.setValue(newPicture.path);
    this.submit();
  }

  protected setMode(newMode: 'view' | 'edit'): void {
    this.mode.set(newMode);
  }

  protected submit(): void {
    
    this.setMode('view');
    if (this.pictureForm().valid && this.pictureForm().controls.picture.value !== this.picture()) {
      this.newPicture.emit({ value: this.pictureForm().controls.picture.value });
    }
  }
}