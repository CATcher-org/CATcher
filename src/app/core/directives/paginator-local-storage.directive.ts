import { Directive, Input, OnInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Directive({
  selector: '[paginatorLocalStorage]'
})
export class PaginatorLocalStorageDirective implements OnInit {
  private element: MatPaginator;
  private key: string;

  @Input() paginatorLocalStorage: string;

  get pageSize() {
    const cachedPageSize = sessionStorage.getItem(this.key) || this.element.pageSize;
    return Number(cachedPageSize);
  }

  set pageSize(num: number) {
    const pageSizeToCache = String(num);
    sessionStorage.setItem(this.key, pageSizeToCache);
  }

  constructor(private el: MatPaginator) {
    this.element = el;
  }

  ngOnInit(): void {
    this.key = this.paginatorLocalStorage + '-PageSize';
    this.element.pageSize = this.pageSize;
    this.element.page.subscribe((page: PageEvent) => {
      this.pageSize = page.pageSize;
    });
  }
}
