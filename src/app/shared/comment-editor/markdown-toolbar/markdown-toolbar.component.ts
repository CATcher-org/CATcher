import { Component, Input, OnInit } from '@angular/core';
import '@github/markdown-toolbar-element';

@Component({
  selector: 'app-markdown-toolbar',
  templateUrl: './markdown-toolbar.component.html',
  styleUrls: ['./markdown-toolbar.component.css']
})
export class MarkdownToolbarComponent implements OnInit {
  constructor() {}

  @Input() forTextAreaId: string; // Compulsory Input

  ngOnInit() {}
}
