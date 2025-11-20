import { Accordion, AccordionItem } from "@heroui/react";

export default function App() {
  const faqs = [
    {
      key: "1",
      title: "¿Qué documentos necesito para vender una propiedad?",
      content: "Necesitarás el título de propiedad, DNI de los titulares, últimas boletas de servicios (luz, gas, agua), libre de deudas de impuestos y servicios, y en algunos casos, planos de la propiedad. Es recomendable consultar con un escribano o un agente inmobiliario para una lista completa y actualizada.",
    },
    {
      key: "2",
      title: "¿Cuál es la diferencia entre tasación y valor de mercado?",
      content: "La tasación es una estimación técnica del valor de una propiedad realizada por un profesional (tasador), basada en criterios objetivos y metodologías específicas. El valor de mercado, en cambio, es el precio real al que una propiedad se vendería en un momento dado, influenciado por la oferta y la demanda, la ubicación, el estado y otros factores subjetivos del mercado.",
    },
    {
      key: "3",
      title: "¿Qué es el boleto de compraventa?",
      content: "El boleto de compraventa es un contrato preliminar que formaliza el acuerdo entre el comprador y el vendedor de una propiedad. Establece las condiciones de la operación, el precio, la forma de pago, los plazos y las penalidades en caso de incumplimiento. Es un paso previo a la escritura traslativa de dominio.",
    },
    {
      key: "4",
      title: "¿Qué gastos implica comprar una propiedad?",
      content: "Al comprar una propiedad, además del precio de venta, se deben considerar gastos como impuestos (ITP, sellos), honorarios de escribanía por la escritura, comisión inmobiliaria, gastos de gestoría, y posibles gastos de hipoteca si aplica. Estos gastos pueden variar según la jurisdicción y el tipo de operación.",
    },
  ];

  return (
    <section class="py-16">
      <div>
        <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Preguntas Frecuentes</h2>
        <Accordion selectionMode="multiple" variant="bordered">
          {faqs.map((faq) => (
            <AccordionItem key={faq.key} aria-label={faq.title} title={faq.title}>
              {faq.content}
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
