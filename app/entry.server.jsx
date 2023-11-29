import {RemixServer} from '@remix-run/react';
import isbot from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext,
) {
  // Create the Content Security Policy
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    // styleSrc: ["'self'", 'https://cdn.shopify.com'],
    imgSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'https://cdn.sanity.io',
      'https://www.youtube.com',
      'https://theme.truestorefront.com',
    ],
    scriptSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'https://cdn.sanity.io',
      'https://www.youtube.com',
    ],
    frameSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'https://cdn.sanity.io',
      'https://www.youtube.com',
    ],
  });

  const body = await renderToReadableStream(
    // Wrap the entire app in the nonce provider
    <NonceProvider>
      <RemixServer context={remixContext} url={request.url} />
    </NonceProvider>,
    {
      // Pass the nonce to react
      nonce,
      signal: request.signal,
      onError(error) {
        // eslint-disable-next-line no-console
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  // Add the CSP header
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
