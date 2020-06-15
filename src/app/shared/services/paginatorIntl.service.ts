import { TranslateService } from '@ngx-translate/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

export class PaginatorI18n extends MatPaginatorIntl {
  itemsPerPageLabel = this.translate.instant('LABELS.PAGINATOR.ITEM_PER_PAGE');
  nextPageLabel = this.translate.instant('LABELS.PAGINATOR.NEXT_PAGE');
  previousPageLabel = this.translate.instant('LABELS.PAGINATOR.PREV_PAGE');
  firstPageLabel = this.translate.instant('LABELS.PAGINATOR.FIRST_PAGE');
  lastPageLabel = this.translate.instant('LABELS.PAGINATOR.LAST_PAGE');

  getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return this.translate.instant('LABELS.PAGINATOR.RANGE_PAGE_LABEL_1', { length });
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex =
      startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return this.translate.instant('LABELS.PAGINATOR.RANGE_PAGE_LABEL_2', {
      startIndex: startIndex + 1,
      endIndex,
      length,
    });
  }
  constructor(private readonly translate: TranslateService) {
    super();
  }
}
