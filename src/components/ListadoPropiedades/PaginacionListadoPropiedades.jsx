import React from "react";
import { Pagination } from "@heroui/react";
import { navigate } from "astro:transitions/client";

export default function App({ total, initialPage, basePath = "/propiedades" }) {
  const [currentPage, setCurrentPage] = React.useState(initialPage);

  const handleChange = (page) => {
    // Usar navigate() para navegación SPA
    const url = new URL(window.location.href);
    url.searchParams.set('page', page);
    
    // Navegación usando View Transitions API de Astro
    navigate(url.pathname + url.search);
    
    // Actualizar estado local
    setCurrentPage(page);
  };

  return (
    <Pagination 
      total={total}
      showControls
      initialPage={initialPage}
      page={currentPage}
      onChange={handleChange}
      variant="flat"
      color="success"
    />
  );
}