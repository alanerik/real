import { Card, CardBody, CardHeader, Skeleton } from "@heroui/react";

export default function CardSkeleton() {
  return (
    <Card className="w-full h-full border border-gray-100">
      {/* Header con imagen skeleton */}
      <CardHeader className="p-0 overflow-hidden">
        <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
          <Skeleton className="w-full h-full rounded-t-lg">
            <div className="w-full h-48 bg-default-300" />
          </Skeleton>
          
          {/* Chip de precio skeleton (flotante) */}
          <div className="absolute top-3 right-3 z-10">
            <Skeleton className="rounded-full">
              <div className="w-20 h-6 bg-default-200 rounded-full" />
            </Skeleton>
          </div>
        </div>
      </CardHeader>

      {/* Body con contenido skeleton */}
      <CardBody className="p-4 flex-grow">
        <div className="space-y-3">
          {/* Título skeleton */}
          <div className="space-y-2">
            <Skeleton className="w-4/5 rounded-lg">
              <div className="h-5 w-4/5 bg-default-200 rounded-lg" />
            </Skeleton>
            <Skeleton className="w-3/5 rounded-lg">
              <div className="h-5 w-3/5 bg-default-200 rounded-lg" />
            </Skeleton>
          </div>
          
          {/* Descripción skeleton */}
          <div className="space-y-2">
            <Skeleton className="w-full rounded-lg">
              <div className="h-3 w-full bg-default-300 rounded-lg" />
            </Skeleton>
            <Skeleton className="w-5/6 rounded-lg">
              <div className="h-3 w-5/6 bg-default-300 rounded-lg" />
            </Skeleton>
            <Skeleton className="w-3/4 rounded-lg">
              <div className="h-3 w-3/4 bg-default-300 rounded-lg" />
            </Skeleton>
          </div>
          
          {/* Botón skeleton */}
          <div className="pt-2">
            <Skeleton className="w-full rounded-lg">
              <div className="h-8 w-full bg-default-200 rounded-lg" />
            </Skeleton>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}