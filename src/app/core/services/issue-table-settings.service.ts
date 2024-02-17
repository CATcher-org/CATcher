import { Injectable } from '@angular/core';
import { TableSettings } from '../models/table-settings.model';
@Injectable({
  providedIn: 'root'
})

/**
 * Responsible for storing and retrieving the table settings for issue tables created
 * Map is required since there can be multiple tables within the same page
 */
export class IssueTableSettingsService {
  private _tableSettingsMap: { [index: string]: TableSettings } = {};

  public getTableSettings(tableName: string) {
    console.log(this._tableSettingsMap);
    return this._tableSettingsMap[tableName] || new TableSettings();
  }

  public setTableSettings(tableName: string, tableSettings: TableSettings) {
    this._tableSettingsMap[tableName] = tableSettings;
  }

  public clearTableSettings() {
    this._tableSettingsMap = {};
  }
}
