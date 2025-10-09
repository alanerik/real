import React from "react";
import { Pagination } from "@heroui/react";
import { navigate } from "astro:transitions/client";

export default function App({ total, initialPage }) {
  const [currentPage, setCurrentPage] = React.useState(initialPage);

  // Sincronizar con initialPage cuando cambia
  React.useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  const handleChange = (page) => {
    // Construir URL con todos los parámetros existentes
    const url = new URL(window.location.href);
    
    if (page === 1) {
      url.searchParams.delete('page');
    } else {
      url.searchParams.set('page', page);
    }
    
    // Navegación usando View Transitions API de Astro
    navigate(url.pathname + url.search);
  };

  return (
    <Pagination 
      total={total}
      showControls
      page={currentPage}
      onChange={handleChange}
      variant="flat"
      color="success"
    />
  );
}