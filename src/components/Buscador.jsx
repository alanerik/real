import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { useBuscador } from "@/hooks/useBuscador.js";

// Constantes centralizadas y exportables
export const CIUDADES = [
  { label: "Pinamar", key: "pinamar" },
  { label: "Valeria del Mar", key: "valeria-del-mar" },
  { label: "Cariló", key: "carilo" },
  { label: "Costa Esmeralda", key: "costa-esmeralda" },
  { label: "General Madariaga", key: "general-madariaga" },
];

export const TIPOS_PROPIEDAD_VENTA = [
  { label: "Terreno", key: "terreno" },
  { label: "Departamento", key: "departamento" },
  { label: "Casa", key: "casa" },
  { label: "Galpón", key: "galpon" },
  { label: "Campo", key: "campo" },
];

export const TIPOS_PROPIEDAD_ALQUILER = [
  { label: "Departamento", key: "departamento" },
  { label: "Casa", key: "casa" },
  { label: "Galpón", key: "galpon" },
  { label: "Campo", key: "campo" },
];

export const NUMERO_AMBIENTES = [
  { label: "1 ambiente", key: "1" },
  { label: "2 ambientes", key: "2" },
  { label: "3 ambientes", key: "3" },
  { label: "4 ambientes", key: "4" },
  { label: "5+ ambientes", key: "5+" },
];

// Configuraciones de layout predefinidas
const LAYOUT_CONFIGS = {
  horizontal: "flex w-full flex-wrap justify-center md:flex-nowrap gap-4 px-3 md:px-0",
  vertical: "flex flex-col gap-4 w-full max-w-sm px-3 md:px-0",
  grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full px-3 md:px-0"
};

// Configuraciones de variante
const VARIANT_CONFIGS = {
  full: { size: "lg", maxWidth: "max-w-lg" },
  compact: { size: "md", maxWidth: "max-w-md" }
};

/**
 * Componente principal de búsqueda de propiedades
 * @param {Object} props
 * @param {('full'|'compact')} props.variant - Variante visual del buscador
 * @param {boolean} props.showCiudad - Mostrar selector de ciudad
 * @param {boolean} props.showTipoVenta - Mostrar selector de tipo de venta
 * @param {boolean} props.showTipoAlquiler - Mostrar selector de tipo de alquiler
 * @param {boolean} props.showAmbientes - Mostrar selector de ambientes
 * @param {('horizontal'|'vertical'|'grid')} props.layout - Disposición de los campos
 * @param {string} props.className - Clases CSS adicionales
 */
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

  // Obtener configuración de la variante
  const { size: inputSize, maxWidth: maxWidthClass } = VARIANT_CONFIGS[variant];
  const layoutClass = LAYOUT_CONFIGS[layout];
  const isCompact = variant === "compact";

  return (
    <div className={`${layoutClass} ${className}`}>
      {showCiudad && (
        <Autocomplete 
          color="default"
          className={maxWidthClass}
          label={isCompact ? "Ciudad" : "Selecciona una ciudad"}
          size={inputSize}
          defaultItems={CIUDADES} 
          onSelectionChange={actions.setCiudad}
          selectedKey={state.ciudadSeleccionada}
        >
          {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
        </Autocomplete>
      )}
      
      {showTipoVenta && (
        <Autocomplete
          color="default"
          className={maxWidthClass}
          size={inputSize}
          defaultItems={TIPOS_PROPIEDAD_VENTA}
          label={isCompact ? "Venta" : "Venta propiedades"}
          onSelectionChange={actions.setTipoVenta}
          selectedKey={state.tipoVenta}
        >
          {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
        </Autocomplete>
      )}
      
      {showTipoAlquiler && (
        <Autocomplete
          color="default"
          className={maxWidthClass}
          size={inputSize}
          defaultItems={TIPOS_PROPIEDAD_ALQUILER}
          label={isCompact ? "Alquiler" : "Alquiler propiedades"}
          onSelectionChange={actions.setTipoAlquiler}
          selectedKey={state.tipoAlquiler}
        >
          {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
        </Autocomplete>
      )}

      {showAmbientes && (
        <Autocomplete
          color="default"
          className={maxWidthClass}
          size={inputSize}
          defaultItems={NUMERO_AMBIENTES}
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

/**
 * Variante compacta del buscador con layout horizontal
 * Ideal para headers o espacios reducidos
 */
export function BuscadorCompacto({ className = "" }) {
  return (
    <Buscador 
      variant="compact" 
      layout="horizontal" 
      className={className}
    />
  );
}

/**
 * Buscador vertical para sidebars
 * Útil para filtros laterales en listados
 */
export function BuscadorSidebar({ className = "" }) {
  return (
    <Buscador 
      variant="compact" 
      layout="vertical" 
      className={className}
    />
  );
}

/**
 * Buscador completo sin filtro de ambientes
 * Para páginas donde no se necesita filtrar por ambientes
 */
export function BuscadorSinAmbientes({ className = "" }) {
  return (
    <Buscador 
      showAmbientes={false}
      className={className}
    />
  );
}

/**
 * Buscador solo con ciudad y tipo de propiedad
 * Versión minimalista para casos simples
 */
export function BuscadorMinimal({ className = "" }) {
  return (
    <Buscador 
      variant="compact"
      showTipoVenta={true}
      showTipoAlquiler={false}
      showAmbientes={false}
      className={className}
    />
  );
}