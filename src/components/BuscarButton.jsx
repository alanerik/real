import { Button } from "@heroui/react";
import { useBuscarButton } from "@/hooks/useBuscador.js";

export default function BuscarButton({ variant, children }) {
  const { isDisabled, handleSearch } = useBuscarButton(variant);

  return (
    <Button
      showAnchorIcon
      color="primary"
      variant="solid"
      onClick={handleSearch}
      isDisabled={isDisabled}
    >
      {children || 'Buscar propiedades'}
    </Button>
  );
}