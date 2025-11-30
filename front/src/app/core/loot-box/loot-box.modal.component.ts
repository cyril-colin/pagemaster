import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { Item, ItemRarityFilters, ItemTag } from '@pagemaster/common/items.types';
import { LootBox } from '@pagemaster/common/lootbox.types';
import { ButtonComponent } from '../design-system/button.component';
import { ResourcePacksStorage } from '../resource-packs-storage.service';

@Component({
  selector: 'app-loot-box-modal',
  standalone: true,
  template: `
    <ds-button mode="secondary" (click)="cancel.emit()">Cancel</ds-button>
    @for(tag of tags; track tag) {
      <ds-button mode="primary" (click)="genMedicineLootBox(tag, 5)">{{tag}}</ds-button>
    }
  `,
  styles: [`
    
  `],
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LootBoxModalComponent {
  public cancel = output<void>();
  public newLootBox = output<LootBox>();

  protected tags = Object.values(ItemTag);

  protected resourcePackService = inject(ResourcePacksStorage);

  protected allItems = computed(() => {
    return this.resourcePackService.resourcePacks().find(pack => pack.theme === 'Post Apocaliptic')!.items.models;
  });

  protected genMedicineLootBox(tag: ItemTag, limit: number): void {
    const possibleItems = this.allItems().filter(item => item.tags.includes(tag));

    // Work with string-keyed rarity rates to avoid strict-indexing issues at compile time
    const candidates: Item[] = [...possibleItems];
    const selected: Item[] = [];

    const getWeight = (item: Item): number => {
      if (!item) return 0;
      const r = item.rarity;
      return ItemRarityFilters[r]?.rate ?? 0;
    };

    // Pick up to `limit` items without replacement using rarity rates as weights
    for (let i = 0; i < limit && candidates.length > 0; i++) {
      const totalWeight = candidates.reduce<number>((sum, it) => sum + getWeight(it), 0);
      if (totalWeight <= 0) break;

      let r = Math.random() * totalWeight;
      let pickIndex = -1;
      for (let j = 0; j < candidates.length; j++) {
        r -= getWeight(candidates[j]);
        if (r <= 0) { pickIndex = j; break; }
      }
      if (pickIndex === -1) pickIndex = candidates.length - 1;

      const [picked] = candidates.splice(pickIndex, 1);
      selected.push(picked);
    }

    // Emit the generated loot box using proper types
    console.warn('Generated medicine loot box:', selected);
    this.newLootBox.emit({ items: selected.map(i => ({ item: i, player: null })) } as LootBox);
  }
}
