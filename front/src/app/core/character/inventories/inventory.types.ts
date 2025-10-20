import { Attributes } from '@pagemaster/common/attributes.types';


export type Inventory = {
  def: Attributes['inventory']['definition'],
  instance: Attributes['inventory']['instance'],
  selected: boolean,
};
