import StrapiClient from '~/lib/strapi';

export async function getHomeProductsHotspot() {
  const query = `
    #graphql
     query {
      home(publicationState: LIVE) {
        data {
          id
          attributes {
            modules {
              ... on ComponentModulesImagehotspot {
                 image {
                    data {
                      id
                      attributes {
                        width
                        height
                        previewUrl
                        name
                        url
                      }
                    }
                  }
                hotspotOption {
                  id
                  position_top
                  position_left
                  product {
                    data {
                      id
                      attributes {
                        handle
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const variables = {};
  try {
    const data = await StrapiClient(query, variables);
    return data;
  } catch (error) {
    // Handle error appropriately, e.g., log it or throw a specific error
    throw new Error(`Failed to fetch data from Strapi: ${error.message}`);
  }
}
