import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from '@heroui/react';
import { navigate } from "astro:transitions/client";

const BreadcrumbsComponent = ({ pathname, codigo, title }) => {
  // Exclude 'detalles' and filter out empty segments
  const pathSegments = pathname.split('/').filter(segment => segment && segment !== 'detalles' && segment !== 'propiedades' && segment !== 'venta' && segment !== 'alquiler');

  // Capitalize the first letter of a string
  const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  // Handle SPA navigation
  const handleNavigation = (href) => {
    if (typeof navigate === 'function') {
      navigate(href);
    } else {
      // Fallback para casos donde navigate no esté disponible
      window.location.href = href;
    }
  };

  return (
    <div className="max-w-7xl mx-auto pt-4">
      <Breadcrumbs>
        <BreadcrumbItem 
          className="cursor-pointer"
          onClick={() => handleNavigation('/')}
        >
          Inicio
        </BreadcrumbItem>
        
        <BreadcrumbItem 
          className="cursor-pointer"
          onClick={() => handleNavigation('/propiedades')}
        >
          Propiedades
        </BreadcrumbItem>
        
        {pathSegments.map((segment, index) => {
          const href = `/propiedades/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLast = index === pathSegments.length - 1;

          if (isLast) {
            return null; // Don't render the slug
          }

          const decodedSegment = decodeURIComponent(segment);

          return (
            <BreadcrumbItem 
              key={href} 
              className="cursor-pointer"
              onClick={() => handleNavigation(href)}
            >
              {capitalize(decodedSegment.replace(/-/g, ' '))}
            </BreadcrumbItem>
          );
        })}
        
        {title && (
          <BreadcrumbItem 
            className="cursor-pointer"
            onClick={() => handleNavigation(pathname)}
          >
            {title}
          </BreadcrumbItem>
        )}
        
        {codigo && (
          <BreadcrumbItem isCurrent={true}>
            {`Código: ${codigo}`}
          </BreadcrumbItem>
        )}
      </Breadcrumbs>
    </div>
  );
};

export default BreadcrumbsComponent;