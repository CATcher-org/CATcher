import { HttpErrorResponse } from '@angular/common/http';
import { RequestError } from '@octokit/request-error';

export const STANDARD_ERROR = new Error('This is a normal error');

export const ERROR_WITH_NODE_MODULES = new Error(`node_modules: there was a problem\n There was an error`);

export const ERROR_WITH_NO_MESSAGE = new Error();

export const HTTP_304_ERROR = new HttpErrorResponse({ status: 304 });

export const HTTP_422_ERROR = new HttpErrorResponse({ status: 422 });

export const HTTP_500_ERROR = new HttpErrorResponse({ status: 500 });

export const HTTP_400_ERROR = new HttpErrorResponse({ status: 400 });

export const OCTOKIT_REQUEST_ERROR = new RequestError('This is an octokit request error', 400, {
  request: { method: 'GET', url: '', headers: {} }
});
