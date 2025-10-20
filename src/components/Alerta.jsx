import {Alert} from "@heroui/react";

export default function Alerta() {
  const description = "AVISO LEGAL: i) Las descripciones arquitectónicas y funcionales, fotos, renders, memorias descriptivas, medidas del inmueble, precios, valores de expensas, impuestos y servicios y fechas de entrega de los emprendimientos son aproximados y meramente orientativos, y no obligan contractualmente a ReaLState y Cía S.A. ni resultan vinculantes; iii) RealState y Cía S.A. recomienda y sugiere al usuario y/o al interesado realizar las verificaciones respectivas previamente a la realización de cualquier operación, requiriendo -a tal fin- por sí o a través de profesionales las copias necesarias de la documentación que estimen necesario conocer con exactitud; iv) En RealState y Cía S.A. estamos a total disposición del interesado para proveerlo de toda información que nos requiera. Ante cualquier duda sobre la información recibida o sobre aquella disponible en nuestro sitio web, por favor consulte.";

  return (
    <div className="flex items-center justify-center w-full mt-4">
      <Alert color="warning" description={description} />
    </div>
  );
}
