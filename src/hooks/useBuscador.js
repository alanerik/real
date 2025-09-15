// hooks/useBuscador.js
import { useState, useEffect } from 'react';
import { getBuscadorStore } from '@/utils/buscadorStore.js';

export function useBuscador() {
  const [state, setState] = useState({
    ciudadSeleccionada: "",
    tipoVenta: "",
    tipoAlquiler: "",
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
    
    reset: () => {
      store.reset();
    },
    
    search: () => {
      try {
        return store.search();
      } catch (error) {
        console.error('Error en búsqueda:', error);
        return false;
      }
    },
    
    getSearchUrl: () => {
      return store.buildSearchUrl();
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
          window.location.href = '/propiedades';
        } else {
          alert("Por favor completa la selección de ciudad y tipo de propiedad");
        }
        return;
      }
      store.search();
    }
  };
}