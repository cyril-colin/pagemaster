import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { forkJoin, map, Observable, switchMap, tap } from 'rxjs';
export type ItemModel = {
  path: string,
  name: string,
  theme: string,
  description: string,
  weight: string,
  origin: string,
  originalSize: {
    height: number,
    width: number,
  },
}

export type ItemsTheme = {theme: string, path: string, models: ItemModel[]};
export type ItemsFile = ItemsTheme[];

export const ITEMS_FILE_PATH = 'items.json';
@Injectable({
  providedIn: 'root',
})
export class ItemsDataState {

  private _itemsFile = signal<ItemsFile>([]);
  public itemsFile = this._itemsFile.asReadonly();

  private http = inject(HttpClient);

  public init() {
    return this.getItemsFile().pipe(
      switchMap(itemsFile => {
        const modelRequests: Observable<ItemsTheme>[] = itemsFile.map(itemTheme => {
          return this.http.get<ItemModel[]>(itemTheme.path).pipe(
            map(models => {
              models.forEach(model => {
                model.path = `${itemTheme.path.split('/').slice(0, -1).join('/')}/${model.path}`;
              });
              itemTheme.models = models;
              return {
                theme: itemTheme.theme,
                path: itemTheme.path,
                models: models,
              };
            }),
          );
        });


        return forkJoin(modelRequests);
      }),
      tap((result) => {
        this._itemsFile.set(result);
      }),
    );
  }

  private getItemsFile() {
    return this.http.get<Omit<ItemsFile, 'models'>>(ITEMS_FILE_PATH);
  }

}