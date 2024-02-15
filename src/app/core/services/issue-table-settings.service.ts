import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class IssueTableSettingsService {
  public sortActiveId = '';
  public sortDirection = '';
  public pageSize = 20;
  public pageIndex = 0;
}
