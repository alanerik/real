import React from "react";
import { Card, CardHeader, CardBody, CardFooter, Image, Button } from "@heroui/react";

const neighborhoods = [
    { title: "Lasalle", span: "md:col-span-2" },
    { title: "Pioneros", span: "md:col-span-1" },
    { title: "Barrio b5", span: "md:col-span-1" },
    { title: "Pinamar Norte", span: "md:col-span-2" },
    { title: "Alamos", span: "md:col-span-1" },
    { title: "Bosques", span: "md:col-span-2" },
];

export default function BentoGrid() {
    return (
        <section aria-labelledby="neighborhoods-heading">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-12">
                    <h2
                        id="neighborhoods-heading"
                        className="text-4xl font-bold text-gray-900 mb-4"
                    >
                        Nuestros Barrios
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Explora las zonas más exclusivas de Pinamar
                    </p>
                </header>

                {/* Container: Grid on Desktop, Carousel on Mobile */}
                {/* Container: Grid on Desktop, Carousel on Mobile */}
                <div className="flex md:grid md:grid-cols-3 gap-4 auto-rows-[300px] overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 scrollbar-hide">
                    {neighborhoods.map((item, index) => (
                        <Card
                            key={index}
                            isPressable
                            className={`w-[90%] md:w-full flex-shrink-0 md:flex-shrink h-[200px] md:h-full relative border-none snap-center ${item.span} col-span-1`}
                        >
                            <Image
                                removeWrapper
                                alt={`Imagen de ${item.title}`}
                                className="z-0 w-full h-full object-cover brightness-75 hover:brightness-50 transition-all duration-300"
                                src="/bosques.webp"
                            />
                            <CardFooter className="absolute z-10 top-0 bottom-0 left-0 right-0 flex justify-center items-center bg-black/20 hover:bg-black/40 transition-colors">
                                <h3 className="text-white font-bold text-3xl drop-shadow-lg tracking-wide text-center px-4">
                                    {item.title}
                                </h3>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
