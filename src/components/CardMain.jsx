import { Card, CardBody, CardHeader, Image, Button, Chip } from "@heroui/react";
import { memo } from "react";
import { navigate } from "astro:transitions/client";

const CardMain = memo(function CardMain({ 
  image, 
  title, 
  description, 
  price, 
  slug,
  imageAlt,
  priority = false 
}) {
  const handleCardClick = () => {
    if (!slug) {
      console.warn('CardMain: slug is required for navigation');
      return;
    }
    
    const targetUrl = `/propiedades/detalles/${slug}`;
    
    
    // Usar navigate para navegación SPA
    if (typeof navigate === 'function') {
     
      navigate(targetUrl);
    } else {
      
      window.location.href = targetUrl;
    }
  };

  return (
    <Card 
      className="w-full h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100"
    >
      {/* Header con imagen */}
      <CardHeader className="p-0 overflow-hidden">
        <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
          <Image
            alt={imageAlt || title || 'Imagen de propiedad'}
            src={image}
            width="100%"
            height="100%"
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
            loading={priority ? "eager" : "lazy"}
            removeWrapper
            fallbackSrc="/images/placeholder-property.jpg"
          />
          
          {/* Chip de precio flotante */}
          <div className="absolute top-3 right-3 z-10">
            <Chip 
              color="success" 
              variant="solid" 
              size="md"
              className="font-semibold shadow-lg"
            >
              {price || 'Consultar'}
            </Chip>
          </div>
        </div>
      </CardHeader>

      {/* Body con contenido */}
      <CardBody className="p-4 flex-grow">
        <div className="space-y-3">
          {/* Título */}
          {title && (
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight">
              {title}
            </h3>
          )}
          
          {/* Descripción */}
          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
            {description || 'Sin descripción disponible'}
          </p>
          
          {/* Botón de acción */}
          <div className="pt-2">
            <Button
              color="primary"
              variant="flat"
              size="sm"
              className="w-full font-medium"
              onPress={() => {
                
                handleCardClick();
              }}
              startContent={
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2} 
                  stroke="currentColor" 
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            >
              Ver Detalles
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
});

export default CardMain;