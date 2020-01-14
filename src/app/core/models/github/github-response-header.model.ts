export interface GithubResponseHeader {
  'cache-control': string;
  'content-type': string;
  'x-github-media-type': string;
  'x-ratelimit-limit': string;
  'x-ratelimit-remaining': string;
  'x-ratelimit-reset': string;
  etag?: string;
  'last-modified'?: string;
  link?: string;
}
