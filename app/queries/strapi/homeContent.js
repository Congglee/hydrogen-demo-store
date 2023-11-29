import StrapiClient from '~/lib/strapi';

export async function getHomeImageHotspot(imageFileId) {
  const data = await StrapiClient(
    `#graphql
      query getImage($imageFileId: ID!) {
        uploadFile(id: $imageFileId) {
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
      }
    `,
    {
      imageFileId: imageFileId,
    }
  );

  return data;
}

export async function getHomeProductsHotspot(productHandles) {
  const filterConditions = productHandles.map(handle => ({ handle: { eq: handle } }));

  const data = StrapiClient(`
    #graphql
      query GetProductsByHandles($productHandles: [ProductFiltersInput]) {
        products(filters: { or: $productHandles } pagination: {} sort: [] publicationState: LIVE) {
          data {
            id
            attributes {
              shopifyID
              title
              handle
              images
              options
              variants
              vendor
            }
          }
          meta {
            pagination {
              page
              pageCount
              pageSize
              total
            }
          }
        }

      }
    `, {
    productHandles: filterConditions,
  });

  return data;
}
