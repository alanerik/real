import {Card, CardFooter, Image, Button} from "@heroui/react";

export default function CardMain({ image, title, description, price, slug }) {
  return (
    <a href={`/propiedades/detalles/${slug}`}>
      <Card isFooterBlurred className="border-none" radius="lg">
        <Image
          alt={title}
          className="object-cover"
          height={200}
          src={image}
          width={370}
        />
        <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
          <div>
            
            <p className="text-tiny text-black/80">{description}</p>
          </div>
          <Button
            className="text-tiny text-black bg-black/20"
            color="default"
            radius="lg"
            size="sm"
            variant="flat"
          >
            {price}
          </Button>
        </CardFooter>
      </Card>
    </a>
  );
}
