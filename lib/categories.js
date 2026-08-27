import { constants } from './constants.js';

/*
 * Google Play no longer renders the category navigation menu in the static
 * HTML of the store pages (it is lazy-loaded client side), so the previous
 * implementation — scraping `ul li a` hrefs from /store/apps — silently
 * degraded to returning just ['APPLICATION'] (#671).
 *
 * The canonical category ids the store accepts are the ones this library
 * already maintains in constants.category (they are what list() validates
 * against, and each maps to a live /store/apps/category/<ID> page), so the
 * list is served from there. The function stays async and keeps accepting
 * (and ignoring) options for backwards compatibility with existing callers.
 */
function categories () {
  return Promise.resolve(Object.keys(constants.category));
}

export default categories;
