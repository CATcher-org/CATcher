import { GithubResponseHeader } from './github-response-header.model';

export interface GithubResponse<T> {
  headers: GithubResponseHeader;
  data: T;
}
