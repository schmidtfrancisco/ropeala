import { AfterViewInit, Component, ElementRef, input, viewChild } from '@angular/core';
import { ProductImagePipe } from '@products/pipes/product-image-pipe';
import { ChevronLeft, ChevronRight, LucideAngularModule } from 'lucide-angular';
import Swiper from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-cube';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { EffectCube, EffectCreative, Navigation, Pagination } from 'swiper/modules';


@Component({
  selector: 'product-carousel',
  imports: [ProductImagePipe, LucideAngularModule],
  templateUrl: './product-carousel.html',
  styleUrl: './product-carousel.css'
})
export class ProductCarousel implements AfterViewInit {
  images = input.required<string[]>();
  swiperDiv = viewChild.required<ElementRef>('swiperDiv');
  prevButton = viewChild.required<ElementRef>('prevButton');
  nextButton = viewChild.required<ElementRef>('nextButton');
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;

  ngAfterViewInit(): void {
    const element = this.swiperDiv().nativeElement;
    if (!element) return;

    const swiper = new Swiper(element, {
      // Optional parameters
      direction: 'horizontal',
      loop: true,
      modules: [EffectCube, Pagination, Navigation],
      effect: 'cube',

      grabCursor: true,      // modules: [Navigation, Pagination],

      // If we need pagination
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        type: 'bullets'
      },

      // Navigation arrows
      navigation: {
        prevEl: this.prevButton().nativeElement,
        nextEl: this.nextButton().nativeElement,
        hideOnClick: true
      },

    });
  }
}
