import {Link} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';

export function ProductHotspotCard({product}) {
  return (
    <div className="absolute z-20 w-72 bg-white rounded p-4 border top-full mt-2 -translate-x-1/2 left-1/2 transition-all duration-300 ease-linear invisible opacity-0 group-hover:visible group-hover:opacity-100">
      <div className="flex flex-col gap-3 relative overflow-hidden">
        <Link to={`/products/${product.node.handle}}`}>
          <div className="aspect-square bg-primary/5">
            <div className="relative overflow-hidden w-full h-full">
              <Image
                data={{
                  url: `${product.node.variants.nodes[0].image.url}`,
                  altText: null,
                }}
                sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
                aspectRatio="1/1"
                className="w-full aspect-square object-cover"
              />
            </div>
            {product.node.variants.nodes[0].compareAtPrice && (
              <div className="absolute z-10 px-2 top-0 right-0 m-4 bg-red-600 text-white text-sm">
                Sale
              </div>
            )}
          </div>
        </Link>
        <div className="flex flex-col flex-1 gap-1">
          <div className="flex items-center justify-between h-6 mt-1 mb-1 text-black">
            <span>{product.node.vendor}</span>
            <div className="flex items-center gap-x-3">
              <div className="cursor-pointer select-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 text-2xl"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                  />
                </svg>
              </div>
              <div className="cursor-pointer select-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="text-2xl w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* <div className="flex items-center gap-x-1">
            <div className="flex items-center gap-x-0.5">
              {Array.from({length: 5}, (_, index) => (
                <div key={index}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill={`${product.id === '36' ? 'gray' : 'orange'}`}
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`w-4 h-4 ${
                      product.node.handle ===
                      'adidas-aeroready-essentials-linear-logo-shorts'
                        ? 'text-gray-500'
                        : 'text-orange-400'
                    }`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                </div>
              ))}
            </div>
            <span className="text-sm text-black">
              (
              {product.node.handle ===
              'adidas-aeroready-essentials-linear-logo-shorts'
                ? '0'
                : '1'}
              )
            </span>
          </div> */}

          <Link to={`/products/${product.node.handle}`}>
            <span className="text-black inline-block font-medium">
              {product.node.title}
            </span>
          </Link>

          <div className="flex gap-x-2">
            {product.node.variants.nodes[0].compareAtPrice ? (
              <>
                <span className="line-through font-medium text-gray-500">
                  {`$${product.node.variants.nodes[0].compareAtPrice.amount}`}
                </span>

                <span className="text-red-600 font-bold">
                  {`$${product.node.variants.nodes[0].price.amount}`}
                </span>
              </>
            ) : (
              <span className="text-black font-bold">
                {`$${product.node.variants.nodes[0].price.amount}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
