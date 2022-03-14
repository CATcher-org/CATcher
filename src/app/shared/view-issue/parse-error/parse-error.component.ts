import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-parse-error',
  templateUrl: './parse-error.component.html',
  styleUrls: ['./parse-error.component.css']
})
export class ParseErrorComponent implements OnInit {
  @Input() phase: string;

  constructor() {}

  ngOnInit() {}
}
