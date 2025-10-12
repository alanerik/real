import React, { useState, useRef } from 'react';
import { Chip, Button } from '@heroui/react';
import MapaFichaTecnica from './FichaTecnica/MapaFichaTecnica.jsx';

const GaleriaFichatecnica = ({ images, property }) => {
  if (!images || images.length === 0) {
    return null; // O un placeholder si no hay imágenes
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMap, setShowMap] = useState(false);
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
        <div className="absolute top-4 right-4 z-[1000] flex gap-2">
          <Button onClick={() => setShowMap(false)} className={!showMap ? 'bg-gray-800 text-white' : 'bg-white/50 text-black'}>
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
</svg>


          </Button>
          <Button onClick={() => setShowMap(true)} className={showMap ? 'bg-gray-800 text-white' : 'bg-white/50 text-black'}>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
</svg>
          </Button>
        </div>
        {showMap ? (
          <div className="w-full h-[500px]">
            <MapaFichaTecnica latitud={property.latitud} longitud={property.longitud} />
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default GaleriaFichatecnica;