import { Directive, Input } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Directive({
  selector: '[itemsPerPage]'
})
export class ItemsPerPageDirective {
  private element: MatPaginator;
  private key: string;

  @Input('itemsPerPage') id: string;

  get pageSize() {
    const cachedPageSize = sessionStorage.getItem(this.key) || this.element.pageSize;
    return +cachedPageSize;
  }

  set pageSize(num: number) {
    const pageSizeToCache = String(num);
    sessionStorage.setItem(this.key, pageSizeToCache);
  }

  constructor(private el: MatPaginator) {
    this.element = el;
  }

  ngOnInit(): void {
    this.key = this.id + '-PageSize';
    this.element.pageSize = this.pageSize;
    this.element.page.subscribe((page: PageEvent) => {
      this.pageSize = page.pageSize;
    });
  }
}
