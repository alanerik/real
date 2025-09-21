import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";

export default defineConfig({
  branch,
  clientId: process.env.PUBLIC_TINA_CLIENT_ID, // Get this from tina.io
  token: process.env.TINA_TOKEN, // Get this from tina.io

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "src/assets",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        name: "propiedades",
        label: "Propiedades",
        path: "src/content/propiedades",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true,
          },
          {
            type: "image",
            name: "image",
            label: "Image",
          },
          {
            type: "number",
            name: "price",
            label: "Price",
          },
          {
            type: "string",
            name: "currency",
            label: "Currency",
          },
          {
            type: "string",
            name: "city",
            label: "City",
          },
          {
            type: "string",
            name: "operation",
            label: "Operation",
          },
          {
            type: "string",
            name: "propertyType",
            label: "Property Type",
          },
          {
            type: "number",
            name: "bathrooms",
            label: "Bathrooms",
          },
          {
            type: "number",
            name: "bedrooms",
            label: "Bedrooms",
          },
          {
            type: "number",
            name: "area",
            label: "Area",
          },
          {
            type: "string",
            name: "codigo",
            label: "Codigo",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ],
  },
});
