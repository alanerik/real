import { Alert } from "@heroui/react";

export default function Alerta() {
  const description = "AVISO LEGAL : Las descripciones arquitectónicas y funcionales, fotos, renders, memorias descriptivas, medidas del inmueble, precios, valores de expensas, impuestos y servicios y fechas de entrega de los emprendimientos son aproximados y meramente orientativos, y no obligan contractualmente a ReaLState y Cía S.A. ni resultan vinculantes.";

  return (
    <div className="flex items-center justify-center w-full mt-4">
      <Alert color="primary" description={description} />
    </div>
  );
}
