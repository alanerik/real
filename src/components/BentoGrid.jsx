import React from "react";
import { Card, CardHeader, CardBody, CardFooter, Image, Button, Link } from "@heroui/react";

const neighborhoods = [
    { title: "LASALLE", span: "md:col-span-2" },
    { title: "PIONEROS", span: "md:col-span-1" },
    { title: "BARRIO B5", span: "md:col-span-1" },
    { title: "PINAMAR NORTE", span: "md:col-span-2" },
    { title: "ALAMOS I", span: "md:col-span-1" },
    { title: "BOSQUES", span: "md:col-span-2" },
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
                            isHoverable
                            className={`w-[90%] md:w-full flex-shrink-0 md:flex-shrink h-[200px] md:h-full relative border-none snap-center ${item.span} col-span-1`}
                        >
                            <Image
                                removeWrapper
                                alt={`Imagen de ${item.title}`}
                                className="z-0 w-full h-full object-cover"
                                src="/bosques.webp"
                                width={600}
                                height={300}
                                loading={index < 2 ? "eager" : "lazy"}
                                decoding="async"
                            />
                            <CardFooter className="absolute z-10 top-0 bottom-0 left-0 right-0 flex justify-center items-center bg-black/20 hover:bg-black/40 transition-colors">
                                <h3 className="text-white font-bold text-3xl drop-shadow-lg tracking-wide text-center px-4">
                                    {item.title}
                                </h3>
                                <Link
                                    href="#"
                                    className="absolute bottom-4 right-4 text-white/90 hover:text-white font-medium flex items-center gap-1"
                                >
                                    Explorar
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
