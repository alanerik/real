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

export default function Buscador() {
  const [state, actions] = useBuscador();

  return (
    <div className="flex w-full flex-wrap justify-center md:flex-nowrap gap-4">
      <Autocomplete 
        className="max-w-xs" 
        label="Selecciona una ciudad" 
        defaultItems={ciudades} 
        placeholder="Busca por ciudad"
        onSelectionChange={actions.setCiudad}
        selectedKey={state.ciudadSeleccionada}
      >
        {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
      </Autocomplete>
      
      <Autocomplete
        className="max-w-xs"
        defaultItems={tiposDePropiedad}
        label="Venta propiedades"
        placeholder="Busca por tipo"
        onSelectionChange={actions.setTipoVenta}
        selectedKey={state.tipoVenta}
      >
        {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
      </Autocomplete>
      
      <Autocomplete
        className="max-w-xs"
        defaultItems={tiposDePropiedadAlquiler}
        label="Alquiler propiedades"
        placeholder="Busca por tipo"
        onSelectionChange={actions.setTipoAlquiler}
        selectedKey={state.tipoAlquiler}
      >
        {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
      </Autocomplete>
    </div>
  );
}