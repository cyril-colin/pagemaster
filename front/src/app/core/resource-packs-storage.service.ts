import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Item } from '@pagemaster/common/items.types';
import { forkJoin, map, Observable, switchMap, tap } from 'rxjs';

export type AvatarModel = {
  path: string,
  name: string,
  theme: string,
  originalSize: {
    height: number,
    width: number,
  },
}

export type ThemedResourcePack = {
  theme: string,
  items: {
    path: string,
    models: Item[],
  },
  avatars: {
    path: string,
    models: AvatarModel[],
  },
};

export type ResourcePack = {
  theme: string,
  items: {
    path: string,
  },
  avatars: {
    path: string,
  },
};

export const RESOURCE_PACKS_FILE_PATH = 'resource-packs.json';

@Injectable({
  providedIn: 'root',
})
export class ResourcePacksStorage {

  private _resourcePacks = signal<ThemedResourcePack[]>([]);
  public resourcePacks = this._resourcePacks.asReadonly();

  private http = inject(HttpClient);

  public init() {
    return this.getResourcePacks().pipe(
      switchMap(resourcePacks => {
        const packRequests: Observable<ThemedResourcePack>[] = resourcePacks.map(pack => {
          const itemsRequest = this.http.get<Item[]>(pack.items.path);

          const avatarsRequest = this.http.get<AvatarModel[]>(pack.avatars.path).pipe(
            map(models => {
              models.forEach(model => {
                model.path = `${pack.avatars.path.split('/').slice(0, -1).join('/')}/${model.path}`;
              });
              return models;
            }),
          );

          return forkJoin({
            items: itemsRequest,
            avatars: avatarsRequest,
          }).pipe(
            map(result => ({
              theme: pack.theme,
              items: {
                path: pack.items.path,
                models: result.items,
              },
              avatars: {
                path: pack.avatars.path,
                models: result.avatars,
              },
            })),
          );
        });

        return forkJoin(packRequests);
      }),
      tap((result) => {
        this._resourcePacks.set(result);
      }),
    );
  }

  private getResourcePacks() {
    return this.http.get<ResourcePack[]>(RESOURCE_PACKS_FILE_PATH);
  }

}