import {createClient} from '@sanity/client';

const client = createClient({
  projectId: '9nq18xri',
  dataset: 'production',
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: '2023-07-01',
});
