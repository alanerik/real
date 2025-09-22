// hooks/useBuscador.js
import { useState, useEffect } from 'react';
import { navigate } from "astro:transitions/client";
import { getBuscadorStore } from '@/utils/buscadorStore.js';

export function useBuscador() {
  const [state, setState] = useState({
    ciudadSeleccionada: "",
    tipoVenta: "",
    tipoAlquiler: "",
    ambientes: "", // NUEVO CAMPO
    isValid: false
  });
  
  const store = getBuscadorStore();

  useEffect(() => {
    // Estado inicial
    setState(store.getState());
    
    // Suscribirse a cambios
    const unsubscribe = store.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  const actions = {
    setCiudad: (ciudad) => {
      store.setState({ ciudadSeleccionada: ciudad });
    },
    
    setTipoVenta: (tipo) => {
      store.setState({ 
        tipoVenta: tipo, 
        tipoAlquiler: tipo ? "" : state.tipoAlquiler 
      });
    },
    
    setTipoAlquiler: (tipo) => {
      store.setState({ 
        tipoAlquiler: tipo, 
        tipoVenta: tipo ? "" : state.tipoVenta 
      });
    },

    // NUEVA ACCIÓN para ambientes
    setAmbientes: (ambientes) => {
      store.setState({ ambientes });
    },
    
    reset: () => {
      store.reset();
    },
    
    search: () => {
      try {
        // El store solo valida y retorna la URL
        const searchUrl = store.search();
        if (searchUrl) {
          navigate(searchUrl);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error en búsqueda:', error);
        return false;
      }
    },
    
    getSearchUrl: () => {
      return store.buildSearchUrl();
    },

    // NUEVA: Obtener filtros activos
    getActiveFilters: () => {
      return store.getActiveFilters();
    }
  };

  return [state, actions];
}

// Hook simplificado solo para el botón de búsqueda
export function useBuscarButton(variant) {
  const [state] = useBuscador();
  const store = getBuscadorStore();

  const isHeader = variant === 'header';

  return {
    isDisabled: isHeader ? false : !state.isValid,
    searchUrl: store.buildSearchUrl(),
    handleSearch: () => {
      if (!state.isValid) {
        if (isHeader) {
          // Usar navigate en lugar de window.location.href
          navigate('/propiedades');
        } else {
          alert("Por favor completa la selección de ciudad y tipo de propiedad");
        }
        return;
      }
      
      // Usar navigate en lugar de store.search()
      const searchUrl = store.search();
      if (searchUrl) {
        navigate(searchUrl);
      }
    }
  };
}

// NUEVO: Hook para mostrar filtros activos (badges, etc.)
export function useActiveFilters() {
  const [state] = useBuscador();
  const store = getBuscadorStore();
  
  return {
    filters: store.getActiveFilters(),
    hasFilters: store.getActiveFilters().length > 0,
    count: store.getActiveFilters().length
  };
}