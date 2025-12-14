import { Route } from '@angular/router';

export type CustomRoute = Omit<Route, 'children' | 'path'> & {
  path: (...params: string[]) => string[],
  children?: CustomRoutes,
};

export type CustomRoutes = Record<string, CustomRoute>;