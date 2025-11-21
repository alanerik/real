import { Button } from "@heroui/react";
import { useBuscarButton } from "@/hooks/useBuscador.js";

export default function BuscarButton({ variant, children }) {
  const { isDisabled, handleSearch } = useBuscarButton(variant);

  if (variant === 'mobile') {
    return (
      <div onClick={handleSearch} className="w-full h-full flex items-center justify-center">
        <svg className="w-6 h-6 mb-1 group-hover:text-[#0D4715]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
        </svg>
      </div>
    );
  }

  return (
    <Button
      showAnchorIcon={variant !== 'header'}
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