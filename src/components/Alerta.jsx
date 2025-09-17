import {Alert} from "@heroui/react";

export default function Alerta() {
  const description = "Las superficies y medidas son aproximadas y a solo efecto orientativo.";

  return (
    <div className="flex items-center justify-center w-full mt-4">
      <Alert color="warning" description={description} />
    </div>
  );
}
