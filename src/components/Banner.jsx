import { Card, Button } from "@heroui/react";

const Banner = () => {
    return (
        <div className="relative">
            <Card
                className="w-full h-96 bg-cover bg-center"
                style={{ backgroundImage: "url('/imgHeroBanner.webp')" }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-transparent"></div>
                <div className="relative h-full flex flex-col justify-center items-start text-white p-4">
                    <h2 className="text-3xl md:text-5xl font-bold w-full md:w-1/3 text-left">Te damos una maxima visibilidad con real state</h2>
                    <Button color="warning" size="lg" className="mt-6 text-lg md:text-2xl">
                        Hacemos una tasacion exitosa
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default Banner;