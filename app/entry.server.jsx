import {RemixServer} from '@remix-run/react';
import isbot from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';
import {createInstance} from 'i18next';
import i18next from './i18next.server';
import {I18nextProvider, initReactI18next} from 'react-i18next';
import Backend from 'i18next-http-backend';
import i18n from './i18n';

export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext,
) {
  let instance = createInstance();
  let lng = await i18next.getLocale(request);
  let ns = i18next.getRouteNamespaces(remixContext);

  await instance
    .use(initReactI18next) // Tell our instance to use react-i18next
    .use(Backend) // Setup our backend
    .init({
      ...i18n, // spread the configuration
      lng, // The locale we detected above
      ns, // The namespaces the routes about to render wants to use
      backend: {loadPath: './public/locales/{{lng}}/{{ns}}.json'},
    });

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
    <I18nextProvider i18n={instance}>
      <NonceProvider>
        <RemixServer context={remixContext} url={request.url} />
      </NonceProvider>
    </I18nextProvider>,
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
