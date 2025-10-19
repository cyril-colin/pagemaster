export type Item = {
  id: string,
  picture: string,
  name: string,
  description: string,
  weight: number,
}

export type ItemInstance = {id: Item['id']};