// utils/buscadorStore.js

class BuscadorStore {
  constructor() {
    this.listeners = new Set();
    this.state = {
      ciudadSeleccionada: "",
      tipoVenta: "",
      tipoAlquiler: "",
      isValid: false
    };
  }

  // Suscribirse a cambios de estado
  subscribe(callback) {
    this.listeners.add(callback);
    
    // Devolver función para desuscribirse
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Actualizar estado
  setState(newState) {
    const prevState = { ...this.state };
    this.state = { 
      ...this.state, 
      ...newState,
      // Calcular validez automáticamente
      isValid: this.calculateIsValid({ ...this.state, ...newState })
    };

    // Solo notificar si el estado cambió
    if (this.hasStateChanged(prevState, this.state)) {
      this.notifyListeners();
    }
  }

  // Obtener estado actual
  getState() {
    return { ...this.state };
  }

  // Validar si la selección es válida
  calculateIsValid(state) {
    return !!(
      state.ciudadSeleccionada && 
      (state.tipoVenta || state.tipoAlquiler)
    );
  }

  // Verificar si el estado cambió
  hasStateChanged(prevState, newState) {
    return JSON.stringify(prevState) !== JSON.stringify(newState);
  }

  // Notificar a todos los listeners
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Error in buscador store listener:', error);
      }
    });
  }

  // Resetear estado
  reset() {
    this.setState({
      ciudadSeleccionada: "",
      tipoVenta: "",
      tipoAlquiler: ""
    });
  }

  // Construir URL de búsqueda
  buildSearchUrl() {
    if (!this.state.isValid) return null;
    
    const operacion = this.state.tipoVenta ? "venta" : "alquiler";
    const tipoPropiedad = this.state.tipoVenta || this.state.tipoAlquiler;
    
    return `/propiedades/${operacion}/${this.state.ciudadSeleccionada}/${tipoPropiedad}`;
  }

  // Validar búsqueda (sin navegación)
  search() {
    if (!this.state.isValid) {
      throw new Error("Selección inválida para realizar búsqueda");
    }
    return this.buildSearchUrl();
  }
}

// Crear instancia global singleton
let buscadorStore = null;

export function getBuscadorStore() {
  if (typeof window === 'undefined') {
    // En servidor, devolver mock
    return {
      subscribe: () => () => {},
      setState: () => {},
      getState: () => ({ ciudadSeleccionada: "", tipoVenta: "", tipoAlquiler: "", isValid: false }),
      reset: () => {},
      buildSearchUrl: () => null,
      search: () => false
    };
  }

  if (!buscadorStore) {
    buscadorStore = new BuscadorStore();
    
    // Para debugging en desarrollo
    if (import.meta.env.DEV) {
      window.buscadorStore = buscadorStore;
    }
  }

  return buscadorStore;
}

// Exportar instancia por defecto
export default getBuscadorStore();