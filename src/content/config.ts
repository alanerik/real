import { defineCollection, z } from 'astro:content';

const propiedadesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    price: z.number(),
    currency: z.string(),
    city: z.string(),
    operation: z.enum(['venta', 'alquiler']),
    propertyType: z.string(),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    // NUEVO: Campo ambientes (calculado o directo)
    ambientes: z.number().optional(),
    area: z.number().optional(),
    orientation: z.string().optional(),
    codigo: z.string().optional(),
    features: z.array(z.string()).optional(),
  }),
});

export const collections = {
  propiedades: propiedadesCollection,
};