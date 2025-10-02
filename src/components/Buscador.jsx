import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { useBuscador } from "@/hooks/useBuscador.js";

export const ciudades = [
  { label: "Pinamar", key: "pinamar" },
  { label: "Valeria del Mar", key: "valeria-del-mar" },
  { label: "Carilo", key: "carilo" },
  { label: "Costa Esmeralda", key: "costa-esmeralda" },
  { label: "General Madariaga", key: "general-madariaga" },
];

export const tiposDePropiedad = [
  { label: "Terreno", key: "terreno" },
  { label: "Departamento", key: "departamento" },
  { label: "Casa", key: "casa" },
  { label: "Galpon", key: "galpon" },
  { label: "Campo", key: "campo" },
];

export const tiposDePropiedadAlquiler = [
  { label: "Departamento", key: "departamento" },
  { label: "Casa", key: "casa" },
  { label: "Galpon", key: "galpon" },
  { label: "Campo", key: "campo" },
];

export const numeroAmbientes = [
  { label: "1 ambiente", key: "1" },
  { label: "2 ambientes", key: "2" },
  { label: "3 ambientes", key: "3" },
  { label: "4 ambientes", key: "4" },
  { label: "5+ ambientes", key: "5+" },
];

export default function Buscador({ 
  variant = "full", 
  showCiudad = true, 
  showTipoVenta = true, 
  showTipoAlquiler = true, 
  showAmbientes = false,
  layout = "horizontal",
  className = ""
}) {
  const [state, actions] = useBuscador();

  // Diferentes layouts
  const layoutClasses = {
    horizontal: "flex w-full flex-wrap justify-center md:flex-nowrap gap-4",
    vertical: "flex flex-col gap-4 w-full max-w-sm",
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full"
  };

  // Variantes de componente
  const isCompact = variant === "compact";
  const isInline = variant === "inline";

  return (
    <div className={`${layoutClasses[layout]} ${className}`}>
      {showCiudad && (
        <Autocomplete 
          color="success"
          className={isCompact ? "max-w-xs" : "max-w-xs"} 
          label={isCompact ? "Ciudad" : "Selecciona una ciudad"}
          size={isCompact ? "sm" : "md"}
          defaultItems={ciudades} 
         
          onSelectionChange={actions.setCiudad}
          selectedKey={state.ciudadSeleccionada}
        >
          {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
        </Autocomplete>
      )}
      
      {showTipoVenta && (
        <Autocomplete
          color="primary"
          className={isCompact ? "max-w-xs" : "max-w-xs"}
          size={isCompact ? "sm" : "md"}
          defaultItems={tiposDePropiedad}
          label={isCompact ? "Venta" : "Venta propiedades"}
         
          onSelectionChange={actions.setTipoVenta}
          selectedKey={state.tipoVenta}
        >
          {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
        </Autocomplete>
      )}
      
      {showTipoAlquiler && (
        <Autocomplete
          color="warning"
          className={isCompact ? "max-w-xs" : "max-w-xs"}
          size={isCompact ? "sm" : "md"}
          defaultItems={tiposDePropiedadAlquiler}
          label={isCompact ? "Alquiler" : "Alquiler propiedades"}
     
          onSelectionChange={actions.setTipoAlquiler}
          selectedKey={state.tipoAlquiler}
        >
          {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
        </Autocomplete>
      )}

      {showAmbientes && (
        <Autocomplete
          color="secondary"
          className={isCompact ? "max-w-xs" : "max-w-xs"}
          size={isCompact ? "sm" : "md"}
          defaultItems={numeroAmbientes}
          label={isCompact ? "Ambientes" : "Número de ambientes"}
          
          onSelectionChange={actions.setAmbientes}
          selectedKey={state.ambientes}
        >
          {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
        </Autocomplete>
      )}
    </div>
  );
}

// Componentes específicos para casos comunes
export function BuscadorCompacto({ className = "" }) {
  return (
    <Buscador 
      variant="compact" 
      layout="horizontal" 
      className={className}
    />
  );
}

export function BuscadorSidebar({ className = "" }) {
  return (
    <Buscador 
      variant="compact" 
      layout="vertical" 
      className={className}
    />
  );
}

export function BuscadorSinAmbientes({ className = "" }) {
  return (
    <Buscador 
      showAmbientes={false}
      className={className}
    />
  );
}