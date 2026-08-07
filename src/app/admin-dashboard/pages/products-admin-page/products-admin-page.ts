import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductsTable } from "@products/components/products-table/products-table";
import { ProductsService } from '@products/services/products.service';
import { PaginationService } from '@shared/components/pagination/pagination.service';
import { Pagination } from "@shared/components/pagination/pagination";
import { RouterLink } from "@angular/router";
import { FormRequestStatus } from '@shared/interfaces/form-request-status.interface';

const INITIAL_FORM_STATUS: FormRequestStatus = { isLoading: false, error: null, completedSuccessfully: false }

@Component({
  selector: 'app-products-admin-page',
  imports: [ProductsTable, Pagination, RouterLink],
  templateUrl: './products-admin-page.html',
})
export class ProductsAdminPage {
  productsService = inject(ProductsService);
  paginationService = inject(PaginationService);
  productsPerPage = signal(10);
  productsToDelete = signal(new Set<string>());
  formRequestStatus = signal<FormRequestStatus>(INITIAL_FORM_STATUS);
  deletionModal = viewChild.required<ElementRef>('deleteModal');

  productsResource = rxResource({
    params: () => ({
      page: this.paginationService.currentPage(),
      productsPerPage: this.productsPerPage(),
    }),
    stream: ({ params }) => {
      return this.productsService.getProducts({
        offset: (params.page - 1) * params.productsPerPage,
        limit: params.productsPerPage,
      });
    }
  });

  onProductChecked(productId: string) {
    this.productsToDelete.update(current => {
      const set = new Set(current);

      if (set.has(productId)) {
        set.delete(productId);
      } else {
        set.add(productId);
      }

      return set;
    });
  }

  deleteProducts() {
    this.formRequestStatus.set({ isLoading: true, error: null, completedSuccessfully: false });
    const productsIds = Array.from(this.productsToDelete().values());

    this.productsService.deleteProducts(productsIds).subscribe(resp => {
      if (!resp.success) {
        this.formRequestStatus.set({
          isLoading: false,
          error: resp.error ?? 'Error',
          completedSuccessfully: false
        });
        return;
      }

      const dialog: HTMLDialogElement = this.deletionModal().nativeElement;
      dialog.close();
      this.formRequestStatus.set({
        isLoading: false,
        error: '',
        completedSuccessfully: true
      });
      setTimeout(() => {
        this.formRequestStatus.set(INITIAL_FORM_STATUS);
      }, 3000);
    })

  }
}
