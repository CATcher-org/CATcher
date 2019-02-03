/**
 * Will return in the format of { paginateAction: number }
 * Example { next: '15', last: '34', first: '1', prev: '13' }
 *
 * ref: https://developer.github.com/v3/guides/traversing-with-pagination/
 *
 * @param linkStr represent the pagination string provided by github API.
 *
 */
export function githubPaginatorParser(linkStr: string) {
  return linkStr.split(',').map((paginateItem) => {
    return paginateItem.split(';').map((curr, idx) => {
      if (idx === 0) {
        return /[^_]page=(\d+)/.exec(curr)[1];
      }
      if (idx === 1) {
        return /rel="(.+)"/.exec(curr)[1];
      }
    });
  }).reduce((obj, curr) => {
    obj[curr[1]] = curr[0];
    return obj;
  }, {});
}
