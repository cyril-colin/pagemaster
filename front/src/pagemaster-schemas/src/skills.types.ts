/**
 * To define the skills that a character can have.
 * 
 * For example, a lockpicking skill could have a description,
 * a picture, and an id.
 */
export type Skill = {
  id: string,
  name: string,
  description: string,
  picture: string,
}

export type SkillInstance = {id: Skill['id']}