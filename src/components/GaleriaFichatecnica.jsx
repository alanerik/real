import React, { useState, useRef } from 'react';
import { Chip, Button } from '@heroui/react';

const GaleriaFichatecnica = ({ images }) => {
  if (!images || images.length === 0) {
    return null; // O un placeholder si no hay imágenes
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, offsetWidth } = scrollContainerRef.current;
      const index = Math.round(scrollLeft / offsetWidth);
      setCurrentIndex(index);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -scrollContainerRef.current.offsetWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: scrollContainerRef.current.offsetWidth, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto sm:px-0 ">
      <div className="relative group">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="overflow-x-auto snap-x snap-mandatory scroll-smooth flex"
        >
          {images.map((image, index) => (
            <div className="snap-center flex-shrink-0 w-full h-[500px]" key={index}>
              <img src={image} alt={`Imagen de la propiedad ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 right-4 z-10">
          <Chip>
            {currentIndex + 1} / {images.length}
          </Chip>
        </div>
        <div className="flex absolute top-1/2 -translate-y-1/2 w-full justify-between px-4">
          <Button onClick={scrollLeft} disabled={currentIndex === 0} className="bg-white/50 text-black">
            &#10094;
          </Button>
          <Button onClick={scrollRight} disabled={currentIndex === images.length - 1} className="bg-white/50 text-black">
            &#10095;
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GaleriaFichatecnica;
