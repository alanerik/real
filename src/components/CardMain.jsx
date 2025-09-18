import { Card, CardFooter, Image, Button } from "@heroui/react";
import { memo } from "react";

const CardMain = memo(function CardMain({ 
  image, 
  title, 
  description, 
  price, 
  slug,
  imageAlt,
  priority = false 
}) {
  const handleCardClick = (e) => {
    // Prevenir navegación si hay algún error
    if (!slug) {
      e.preventDefault();
      console.warn('CardMain: slug is required for navigation');
    }
  };

  return (
    <a 
      href={`/propiedades/detalles/${slug}`}
      className="block transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
      onClick={handleCardClick}
      aria-label={`Ver detalles de ${title || 'propiedad'}`}
    >
      <Card 
        isFooterBlurred 
        className="border-none h-full group"
        radius="lg"
      >
        <div className="relative overflow-hidden">
          <Image
            isZoomed
            alt={imageAlt || title || 'Imagen de propiedad'}
            src={image}
            width={370}
            height={370}
            className="object-cover w-full h-60 transition-transform duration-300 group-hover:scale-110"
            loading={priority ? "eager" : "lazy"}
            removeWrapper
            fallbackSrc="/images/placeholder-property.jpg"
          />
          
          {/* Overlay gradient para mejor legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-2 px-3 absolute before:rounded-xl rounded-large bottom-2 w-[calc(100%_-_16px)] shadow-large ml-2 z-10 backdrop-blur-md">
          <div className="flex-1 min-w-0 mr-2">
            {title && (
              <h3 className="text-sm font-semibold text-white truncate mb-1">
                {title}
              </h3>
            )}
            <p className="text-xs text-white/90 line-clamp-2 leading-relaxed">
              {description || 'Sin descripción disponible'}
            </p>
          </div>
          
          <Button
            className="text-xs font-semibold text-white bg-white/20 hover:bg-white/30  shrink-0"
            color="default"
            radius="lg"
            size="sm"
            variant="flat"
          >
            {price || 'Consultar'}
          </Button>
        </CardFooter>
      </Card>
    </a>
  );
});

export default CardMain;