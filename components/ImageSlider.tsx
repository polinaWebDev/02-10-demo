'use client'

import Image from 'next/image'
import Autoplay from 'embla-carousel-autoplay'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

const SLIDES = [
  { src: '/images/slider/1.webp', alt: 'Слайд 1' },
  { src: '/images/slider/2.webp', alt: 'Слайд 2' },
  { src: '/images/slider/3.webp', alt: 'Слайд 3' },
  { src: '/images/slider/4.webp', alt: 'Слайд 4' },
]

const AUTO_DELAY = 3000

export function ImageSlider() {
  return (
    <Carousel
      className="h-full w-full"
      opts={{ loop: true }}
      plugins={[Autoplay({ delay: AUTO_DELAY, stopOnInteraction: false })]}
    >
      <CarouselContent className="ml-0 h-full">
        {SLIDES.map((slide, i) => (
          <CarouselItem key={slide.src} className="relative h-full pl-0">
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={i === 0}
              sizes="50vw"
              className="object-cover"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  )
}
