

export type GameSessionPermissions = {
  avatar: Pick<DefaultPermissions, 'edit'>
  name: Pick<DefaultPermissions, 'edit'>
  description: Pick<DefaultPermissions, 'edit'>,
  bars: DefaultPermissions,
  statuses: DefaultPermissions,
  inventory: DefaultPermissions & {
    item: Pick<DefaultPermissions, 'delete' | 'add'>
  },
};

type DefaultPermissions = {
  edit: boolean,
  add: boolean,
  delete: boolean,
}

export function getPermissions(isManager: boolean, isMyPlayer: boolean): GameSessionPermissions {
  return {
      avatar: {
        edit: isManager,
      },
      name: {
        edit: isManager,
      },
      description: {
        edit: isManager || isMyPlayer,
      },
      bars: {
        edit: isManager,
        add: isManager,
        delete: isManager,
      },
      statuses: {
        edit: isManager,
        add: isManager,
        delete: isManager,
      },
      inventory: {
        item: {
          add: isManager,
          delete: isManager,
        },
        delete: isManager,
        edit: isManager,
        add: isManager,
      },
    };
}