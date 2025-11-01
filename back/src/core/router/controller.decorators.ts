import { router, serviceContainer } from '../../dependency-container';
import { RouteDefinition } from './route-registry';
const apiPrefix = serviceContainer.configuration.getConfig().apiPrefix;
/**
 * Use this decorator to register a GET route for the decorated method.
 * The method will be called when a GET request is made to the specified path.
 * 
 * @param path The path for the GET route, e.g., '/api/deluge/torrent'.
 * @returns A function that registers the route.
 */
export function Get(path: string, options?: {withoutApiPrefix?: boolean, skipAutomaticResponse?: boolean}) {
  const fullPath = options?.withoutApiPrefix ? path : `${apiPrefix}${path}`;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return function (target: {constructor: {name: string}}, propertyKey: string, descriptor: PropertyDescriptor) {
    router.addRoute(target,  fullPath, 'get', propertyKey as string, options);
  };
};

/**
 * Use this decorator to register a POST route for the decorated method.
 * The method will be called when a POST request is made to the specified path.
 * @param path The path for the POST route, e.g., '/api/deluge/torrent'.
 * @returns A function that registers the route.
 */
export function Post(path: string, options?: RouteDefinition['options']) {
  const fullPath = options?.withoutApiPrefix ? path : `${apiPrefix}${path}`;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return function (target: {constructor: {name: string}}, propertyKey: string, descriptor: PropertyDescriptor) {
    router.addRoute(target, fullPath, 'post', propertyKey as string, options);
  };
};

/**
 * Use this decorator to register a PUT route for the decorated method.
 * The method will be called when a PUT request is made to the specified path.
 * @param path The path for the PUT route, e.g., '/api/deluge/torrent'.
 * @returns A function that registers the route.
 */
export function Put(path: string, options?: RouteDefinition['options']) {
  const fullPath = options?.withoutApiPrefix ? path : `${apiPrefix}${path}`;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return function (target: {constructor: {name: string}}, propertyKey: string, descriptor: PropertyDescriptor) {
    router.addRoute(target, fullPath, 'put', propertyKey as string, options);
  };
};

/**
 * Use this decorator to register a DELETE route for the decorated method.
 * The method will be called when a DELETE request is made to the specified path.
 * @param path The path for the DELETE route, e.g., '/api/deluge/torrent'.
 * @returns A function that registers the route.
 */
export function Delete(path: string, options?: RouteDefinition['options']) {
  const fullPath = options?.withoutApiPrefix ? path : `${apiPrefix}${path}`;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return function (target: {constructor: {name: string}}, propertyKey: string, descriptor: PropertyDescriptor) {
    router.addRoute(target, fullPath, 'delete', propertyKey as string, options);
  };
};

/**
 * Use this decorator to register a PATCH route for the decorated method.
 * The method will be called when a PATCH request is made to the specified path.
 * @param path The path for the PATCH route, e.g., '/api/deluge/torrent'.
 * @returns A function that registers the route.
 */
export function Patch(path: string, options?: RouteDefinition['options']) {
  const fullPath = options?.withoutApiPrefix ? path : `${apiPrefix}${path}`;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return function (target: {constructor: {name: string}}, propertyKey: string, descriptor: PropertyDescriptor) {
    router.addRoute(target, fullPath, 'patch', propertyKey as string, options);
  };
};