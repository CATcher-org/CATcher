import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SharedModule } from '../shared.module';
import { TitleEditorComponent } from './title-editor.component';

@NgModule({
  imports: [SharedModule],
  declarations: [TitleEditorComponent],
  exports: [TitleEditorComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TitleEditorModule {}
