import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PreviewerService {
  private _inPreviewMode = false;

  set inPreviewMode(option: boolean) {
    this._inPreviewMode = option;
  }

  get inPreviewMode() {
    return this._inPreviewMode;
  }
}
