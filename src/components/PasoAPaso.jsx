import { Chip, Link, Divider } from "@heroui/react";

const steps = [
  {
    number: "01.",
    title: "Valuación de la propiedad",
    description: "Basada en variables como ubicación, medidas, estado del inmueble y comparables ofrecidos y vendidos en el mercado actual."
  },
  {
    number: "02.",
    title: "Elaboración plan de marketing",
    description: "Te presentamos en detalle la forma en la que vamos a comercializar tu inmueble para lograr el objetivo deseado."
  },
  {
    number: "03.",
    title: "Exhibición del inmueble",
    description: "Es importante poner en condiciones la propiedad: limpieza, orden, ventilación y buenas condiciones generales."
  },
  {
    number: "04.",
    title: "Negociación y cierre",
    description: "Gestionamos las visitas, negociamos las condiciones y coordinamos toda la documentación necesaria para el cierre."
  }
];

export default function PasoAPasoSection() {
  return (
    <section className="w-full py-16 bg-green-50">
      <div>
        {/* Header */}
        <div className="text-center mb-16">
          <Chip 
            color="warning" 
            variant="flat" 
            className="mb-4"
          >
            Proceso
          </Chip>
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            El paso a paso hacia tu objetivo
          </h2>
          <p className="text-lg text-black/100 max-w-2xl mx-auto">
            Un proceso transparente y profesional para que vendas tu propiedad con total confianza
          </p>
        </div>

        {/* Steps Grid - Diseño asimétrico */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {/* Paso 01 - Ocupa 2 columnas */}
          <div className="md:col-span-2 relative">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <span className="text-7xl md:text-8xl font-bold text-black/10 leading-none">
                {steps[0].number}
              </span>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-black mb-3">
                  {steps[0].title}
                </h3>
                <p className="text-black/100 leading-relaxed text-base md:text-lg">
                  {steps[0].description}
                </p>
              </div>
            </div>
            <Divider className="mt-8 bg-black/20" />
          </div>

          {/* Paso 02 - Ocupa 1 columna */}
          <div className="md:col-span-1 relative">
            <div className="flex flex-col gap-4">
              <span className="text-7xl md:text-8xl font-bold text-black/10 leading-none">
                {steps[1].number}
              </span>
              <div>
                <h3 className="text-2xl font-bold text-black mb-3">
                  {steps[1].title}
                </h3>
                <p className="text-black/100 leading-relaxed">
                  {steps[1].description}
                </p>
              </div>
            </div>
            <Divider className="mt-8 bg-black/20" />
          </div>

          {/* Paso 03 - Ocupa 1 columna */}
          <div className="md:col-span-1 relative">
            <div className="flex flex-col gap-4">
              <span className="text-7xl md:text-8xl font-bold text-black/10 leading-none">
                {steps[2].number}
              </span>
              <div>
                <h3 className="text-2xl font-bold text-black mb-3">
                  {steps[2].title}
                </h3>
                <p className="text-black/100 leading-relaxed">
                  {steps[2].description}
                </p>
              </div>
            </div>
            <Divider className="mt-8 bg-black/20" />
          </div>

          {/* Paso 04 - Ocupa 2 columnas */}
          <div className="md:col-span-2 relative">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <span className="text-7xl md:text-8xl font-bold text-black/10 leading-none">
                {steps[3].number}
              </span>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-black mb-3">
                  {steps[3].title}
                </h3>
                <p className="text-black/100 leading-relaxed text-base md:text-lg">
                  {steps[3].description}
                </p>
              </div>
            </div>
            <Divider className="mt-8 bg-black/20" />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-black text-lg">
            ¿Listo para comenzar? <Link as={Link} isBlock showAnchorIcon href="#" variant="solid" className="font-semibold text-black/100">Contactanos hoy</Link>
          </p>
        </div>
      </div>
    </section>
  );
}