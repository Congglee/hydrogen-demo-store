import {defer} from '@shopify/remix-oxygen';
import {Suspense} from 'react';
import {Await, Link, useLoaderData, useMatches} from '@remix-run/react';
import {
  AnalyticsPageType,
  Pagination,
  Image,
  getPaginationVariables,
} from '@shopify/hydrogen';
import groq from 'groq';

import {
  ProductSwimlane,
  FeaturedCollections,
  Hero,
  PageHeader,
  ProductCard,
  Grid,
  ProductHotspotCard,
} from '~/components';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getHeroPlaceholder} from '~/lib/placeholders';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';
import {getImageLoadingPriority} from '~/lib/const';
import {
  getHomeImageHotspot,
  getHomeProductsHotspot,
} from '../queries/strapi/homeContent';
import {API_URL} from '~/lib/strapi';

export const headers = routeHeaders;

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({params, request, context}) {
  const {language, country} = context.storefront.i18n;
  const variables = getPaginationVariables(request, {pageBy: 8});
  const {session} = context;

  if (
    params.locale &&
    params.locale.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    // If the locale URL param is defined, yet we still are on `EN-US`
    // the the locale param must be invalid, send to the 404 page
    throw new Response(null, {status: 404});
  }

  const {shop, hero} = await context.storefront.query(HOMEPAGE_SEO_QUERY, {
    variables: {handle: 'freestyle'},
  });

  const {collection} = await context.storefront.query(
    FREE_STYLE_COLLECTIONS_QUERY,
    {
      variables: {
        country,
        language,
        sortKey: 'CREATED',
      },
    },
  );

  const strapiHomeHotspot = await getHomeProductsHotspot();
  let queryString = '';
  if (strapiHomeHotspot) {
    const productHandles = strapiHomeHotspot.data.home.data.attributes.modules
      .filter((module) => module.hotspotOption)
      .flatMap((module) =>
        module.hotspotOption.map(
          (option) => option.product.data.attributes.handle,
        ),
      );

    queryString = productHandles
      .map((handle) => `(handle:${handle})`)
      .join(' OR ');
    session.set('productHandles', queryString);
  }

  const {search} = await context.storefront.query(HOTSPOT_PRODUCTS_QUERY, {
    variables: {
      query: session.get('productHandles'),
      ...variables,
      country,
      language,
    },
  });

  const seo = seoPayload.home();

  return defer({
    shop,
    primaryHero: hero,
    // These different queries are separated to illustrate how 3rd party content
    // fetching can be optimized for both above and below the fold.
    featuredProducts: context.storefront.query(
      HOMEPAGE_FEATURED_PRODUCTS_QUERY,
      {
        variables: {
          /**
           * Country and language properties are automatically injected
           * into all queries. Passing them is unnecessary unless you
           * want to override them from the following default:
           */
          country,
          language,
        },
      },
    ),
    secondaryHero: context.storefront.query(COLLECTION_HERO_QUERY, {
      variables: {
        handle: 'backcountry',
        country,
        language,
      },
    }),
    featuredCollections: context.storefront.query(FEATURED_COLLECTIONS_QUERY, {
      variables: {
        country,
        language,
      },
    }),
    tertiaryHero: context.storefront.query(COLLECTION_HERO_QUERY, {
      variables: {
        handle: 'winter-2022',
        country,
        language,
      },
    }),
    analytics: {
      pageType: AnalyticsPageType.home,
    },
    freeStyleCollections: collection,
    strapiHomeHotspot: strapiHomeHotspot.data,
    hotspotProducts: search.edges,
    seo,
  });
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const {
    primaryHero,
    secondaryHero,
    tertiaryHero,
    featuredCollections,
    featuredProducts,
    freeStyleCollections,
    accessories,
    strapiHomeHotspot,
    hotspotProducts,
  } = useLoaderData();

  const homeHotspotData = strapiHomeHotspot.home.data;
  const imageHotspot = homeHotspotData.attributes.modules.find(
    (module) => module.image,
  );
  const hotspotOptions = homeHotspotData.attributes.modules.find(
    (module) => module.hotspotOption,
  );

  // TODO: skeletons vs placeholders
  const skeletons = getHeroPlaceholder([{}, {}, {}]);

  return (
    <>
      {primaryHero && (
        <Hero {...primaryHero} height="full" top loading="eager" />
      )}

      <section className="min-h-[140px] lg:min-h-[400px]">
        <div className="inline-block w-full">
          <div className="mx-auto px-12 mb-12 md:mb-20">
            <div className="relative">
              {imageHotspot && (
                <Image
                  data={{
                    url: `${API_URL}${imageHotspot.image.data.attributes.url}`,
                    altText: null,
                  }}
                  sizes="(max-width: 32em) 100vw, 33vw"
                  aspectRatio={`${imageHotspot.image.data.attributes.width}/${imageHotspot.image.data.attributes.height}`}
                  className="object-cover w-full mb-5"
                />
              )}

              {hotspotOptions &&
                hotspotOptions.hotspotOption?.map((option, index) => {
                  const hotspotProduct = hotspotProducts.find(
                    (product) =>
                      product.node.handle ===
                      option.product.data.attributes.handle,
                  );
                  const hotspotStyle = {
                    left: `${option.position_left}%`,
                    top: `${option.position_top}%`,
                  };
                  return (
                    <div
                      className={`absolute group`}
                      style={hotspotStyle}
                      key={option.id}
                    >
                      <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center cursor-pointer text-black">
                        +
                      </div>

                      {hotspotProduct && (
                        <ProductHotspotCard product={hotspotProduct} />
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </section>

      {featuredProducts && (
        <Suspense>
          <Await resolve={featuredProducts}>
            {({products}) => {
              if (!products?.nodes) return <></>;
              return (
                <ProductSwimlane
                  products={products}
                  title="Featured Products"
                  count={4}
                />
              );
            }}
          </Await>
        </Suspense>
      )}

      {secondaryHero && (
        <Suspense fallback={<Hero {...skeletons[1]} />}>
          <Await resolve={secondaryHero}>
            {({hero}) => {
              if (!hero) return <></>;
              return <Hero {...hero} />;
            }}
          </Await>
        </Suspense>
      )}

      {featuredCollections && (
        <Suspense>
          <Await resolve={featuredCollections}>
            {({collections}) => {
              if (!collections?.nodes) return <></>;
              return (
                <FeaturedCollections
                  collections={collections}
                  title="Collections"
                />
              );
            }}
          </Await>
        </Suspense>
      )}

      {tertiaryHero && (
        <Suspense fallback={<Hero {...skeletons[2]} />}>
          <Await resolve={tertiaryHero}>
            {({hero}) => {
              if (!hero) return <></>;
              return <Hero {...hero} />;
            }}
          </Await>
        </Suspense>
      )}

      {/* <PageHeader heading="Freestyle Collection" variant="blogPost" />
      {freeStyleCollections && (
        <div className="w-full gap-x-4 md:gap-8 grid px-6 md:px-8 lg:px-12 border-none">
          <Pagination connection={freeStyleCollections.products}>
            {({nodes, isLoading, NextLink, PreviousLink}) => {
              const itemsMarkup = nodes.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  loading={getImageLoadingPriority(i)}
                />
              ));

              return (
                <>
                  <div className="flex items-center justify-center">
                    <PreviousLink className="inline-block rounded font-medium text-center py-3 px-6 border border-primary/10 bg-contrast text-primary w-full">
                      {isLoading ? 'Loading...' : 'Previous'}
                    </PreviousLink>
                  </div>
                  <Grid data-test="product-grid">{itemsMarkup}</Grid>
                </>
              );
            }}
          </Pagination>
        </div>
      )} */}
    </>
  );
}

const COLLECTION_CONTENT_FRAGMENT = `#graphql
  fragment CollectionContent on Collection {
    id
    handle
    title
    descriptionHtml
    heading: metafield(namespace: "hero", key: "title") {
      value
    }
    byline: metafield(namespace: "hero", key: "byline") {
      value
    }
    cta: metafield(namespace: "hero", key: "cta") {
      value
    }
    spread: metafield(namespace: "hero", key: "spread") {
      reference {
        ...Media
      }
    }
    spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {
      reference {
        ...Media
      }
    }
  }
  ${MEDIA_FRAGMENT}
`;

const HOMEPAGE_SEO_QUERY = `#graphql
  query seoCollectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
    shop {
      name
      description
    }
  }
  ${COLLECTION_CONTENT_FRAGMENT}
`;

const COLLECTION_HERO_QUERY = `#graphql
  query heroCollectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
  }
  ${COLLECTION_CONTENT_FRAGMENT}
`;

// @see: https://shopify.dev/api/storefront/current/queries/products
export const HOMEPAGE_FEATURED_PRODUCTS_QUERY = `#graphql
  query homepageFeaturedProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 8) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

// @see: https://shopify.dev/api/storefront/current/queries/collections
export const FEATURED_COLLECTIONS_QUERY = `#graphql
  query homepageFeaturedCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(
      first: 4,
      sortKey: UPDATED_AT
    ) {
      nodes {
        id
        title
        handle
        image {
          altText
          width
          height
          url
        }
      }
    }
  }
`;

export const FREE_STYLE_COLLECTIONS_QUERY = `#graphql
  query freeStyleCollections($country: CountryCode, $language: LanguageCode, $sortKey: ProductCollectionSortKeys)
  @inContext(country: $country, language: $language) {
    collection(handle: "freestyle") {
      id
      handle
      image {
        height
        id
        width
        url
      }
      title
      products(first: 4, reverse: true, sortKey: $sortKey) {
        nodes {
          id
          title
          publishedAt
          handle
          vendor
          variants(first: 1) {
            nodes {
              id
              availableForSale
              image {
                url
                altText
                width
                height
              }
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
              product {
                handle
                title
              }
            }
          }
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          startCursor
          endCursor
        }
      }
    }
  }
`;

const HOTSPOT_PRODUCTS_QUERY = `#graphql
  query HotSpotProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $query: String!
  ) @inContext(country: $country, language: $language) {
    search(first: $first, last: $last, before: $startCursor, after: $endCursor, query: $query) {
      edges {
        node {
          ... on Product {
            ...ProductCard
          }
        }
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
