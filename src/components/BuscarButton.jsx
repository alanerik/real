import { Button } from "@heroui/react";
import { useBuscarButton } from "@/hooks/useBuscador.js";

export default function BuscarButton({ variant, children }) {
  const { isDisabled, handleSearch } = useBuscarButton(variant);

  return (
    <Button
      showAnchorIcon
      color="success"
      variant="solid"
      onClick={handleSearch}
      isDisabled={isDisabled}
      size="lg"
    >
      {children || 'Buscar propiedades'}
    </Button>
  );
}