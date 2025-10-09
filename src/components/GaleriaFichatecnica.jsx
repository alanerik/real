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

  return (
    <div className="w-full max-w-7xl mx-auto sm:px-0 py-6">
      {/* Grid de Galería for Desktop */}
      <div className="hidden md:relative md:grid md:grid-cols-4 md:gap-2 md:h-[500px]">
        {/* Imagen principal grande */}
        <div className="col-span-2 row-span-2 relative overflow-hidden rounded-l-lg">
          <img 
            src={images[0]} 
            alt="Imagen principal"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Imágenes secundarias */}
        {images.slice(1, 5).map((img, idx) => (
          <div 
            key={idx}
            className={`relative overflow-hidden ${
              idx === 1 ? 'rounded-tr-lg' : ''
            } ${idx === 3 ? 'rounded-br-lg' : ''}`}
          >
            <img 
              src={img} 
              alt={`Imagen ${idx + 2}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Botón "Ver todas las fotos" */}
        <div className="absolute bottom-4 right-4">
          <Button 
           
          >
            Ver todas las {images.length} fotos
          </Button>
        </div>
      </div>

      {/* Carousel for Mobile */}
      <div className="md:hidden relative">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="overflow-x-auto snap-x snap-mandatory scroll-smooth flex"
        >
          {images.map((image, index) => (
            <div className="snap-center flex-shrink-0 w-full h-[300px]" key={index}>
              <img src={image} alt={`Imagen de la propiedad ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 right-4 z-10">
          <Chip>
            {currentIndex + 1} / {images.length}
          </Chip>
        </div>
      </div>
    </div>
  );
};

export default GaleriaFichatecnica;
