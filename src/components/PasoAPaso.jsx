import { Chip, Link, Card, Divider } from "@heroui/react";

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
    <section className="w-full py-16 ">
      <div className="container mx-auto ">
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

        {/* Single Card with Steps */}
        <Card className="p-4
        ">
          <div className="flex flex-col md:flex-row items-stretch">
            {steps.reduce((acc, step, index) => {
                acc.push(
                    <div key={step.number} className="flex-1 lg:p-2">
                        <div className="flex flex-col items-start gap-4">
                            <span className="text-8xl font-bold bg-gradient-to-br from-green-400 to-green-600 bg-clip-text text-transparent leading-none">
                                {step.number}
                            </span>
                            <h3 className="text-2xl font-bold text-black mb-2">
                                {step.title}
                            </h3>
                            <p className="text-black/100 leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    </div>
                );

                if (index < steps.length - 1) {
                    acc.push(<Divider key={`divider-h-${index}`} className="my-8 md:hidden" />);
                    acc.push(<Divider key={`divider-v-${index}`} orientation="vertical" className="hidden md:block" />);
                }

                return acc;
            }, [])}
          </div>
        </Card>

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