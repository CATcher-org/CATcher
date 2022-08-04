import { Component, Input } from '@angular/core';
import '@github/markdown-toolbar-element';

@Component({
  selector: 'app-markdown-toolbar',
  templateUrl: './markdown-toolbar.component.html',
  styleUrls: ['./markdown-toolbar.component.css']
})
export class MarkdownToolbarComponent {
  // Specifies the text area element that this
  //   toolbar would operate on
  @Input() forTextAreaId: string; // Compulsory Input
}
