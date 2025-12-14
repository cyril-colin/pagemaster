import { Route } from '@angular/router';
import { CustomRoutes } from './custom-routes';

/**
 * Converts CustomRoutes structure to Angular Route array
 */
export function convertToAngularRoutes(customRoutes: CustomRoutes): Route[] {
  return Object.values(customRoutes).map((customRoute) => {
    const { children, ...routeProps } = customRoute;
    
    const route: Route = {
      ...routeProps,
      path: routeProps.path().join('/'),
    };
    
    if (children) {
      route.children = convertToAngularRoutes(children);
    }
    
    return route;
  });
}
