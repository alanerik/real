import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: '2ba0e6257c48c9d0c9ce56622e9026837067cbc5', queries,  });
export default client;
  