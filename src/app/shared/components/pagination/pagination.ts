import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pagination',
  imports: [RouterLink],
  templateUrl: './pagination.html',
})
export class Pagination {
  currentPage = input<number>(1);
  totalPages = input<number>(0);

  getPagesList = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  })
}
