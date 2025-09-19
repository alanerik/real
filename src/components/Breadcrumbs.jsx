import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from '@heroui/react';

const BreadcrumbsComponent = ({ pathname, codigo, title }) => {
  // Exclude 'detalles' and filter out empty segments
  const pathSegments = pathname.split('/').filter(segment => segment && segment !== 'detalles' && segment !== 'propiedades');

  // Capitalize the first letter of a string
  const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pt-4">
      <Breadcrumbs>
        <BreadcrumbItem href="/">Inicio</BreadcrumbItem>
        <BreadcrumbItem href="/propiedades">Propiedades</BreadcrumbItem>
        {pathSegments.map((segment, index) => {
          const href = `/propiedades/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLast = index === pathSegments.length - 1;

          if (isLast) {
            return null; // Don't render the slug
          }

          const decodedSegment = decodeURIComponent(segment);

          return (
            <BreadcrumbItem key={href} href={href}>
              {capitalize(decodedSegment.replace(/-/g, ' '))}
            </BreadcrumbItem>
          );
        })}
        {title && <BreadcrumbItem href={pathname}>{title}</BreadcrumbItem>}
        {codigo && <BreadcrumbItem isCurrent={true}>{`Código: ${codigo}`}</BreadcrumbItem>}
      </Breadcrumbs>
    </div>
  );
};

export default BreadcrumbsComponent;
