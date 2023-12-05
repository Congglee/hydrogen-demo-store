import {json} from '@shopify/remix-oxygen';
import {Form, useActionData, useLoaderData} from '@remix-run/react';
import {redirect} from '@remix-run/server-runtime';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';

import {getInputStyleClasses} from '~/lib/utils';
import {Link} from '~/components';

export const handle = {
  isPublic: true,
  i18n: 'login',
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({context, params}) {
  const customerAccessToken = await context.session.get('customerAccessToken');

  if (customerAccessToken) {
    return redirect(params.locale ? `${params.locale}/account` : '/account');
  }

  // if (params.locale) {
  //   const match = params.locale.match(/en-(\w+)/);
  //   const extractedLanguage = match ? match[1] : null;
  //   console.log(match);
  //   if (extractedLanguage) {
  //     return redirect(`/account/login?lng=${extractedLanguage}`);
  //   }
  // }

  // TODO: Query for this?
  return json({shopName: 'Hydrogen'});
}

/**
 * @param {ActionData} data
 */
const badRequest = (data) => json(data, {status: 400});

/**
 * @type {ActionFunction}
 */
export const action = async ({request, context, params}) => {
  const formData = await request.formData();

  const email = formData.get('email');
  const password = formData.get('password');

  if (
    !email ||
    !password ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    return badRequest({
      formError: 'Please provide both an email and a password.',
    });
  }

  const {session, storefront, cart} = context;

  try {
    const customerAccessToken = await doLogin(context, {email, password});
    session.set('customerAccessToken', customerAccessToken);

    // Sync customerAccessToken with existing cart
    const result = await cart.updateBuyerIdentity({customerAccessToken});

    // Update cart id in cookie
    const headers = cart.setCartId(result.cart.id);

    headers.append('Set-Cookie', await session.commit());

    return redirect(params.locale ? `/${params.locale}/account` : '/account', {
      headers,
    });
  } catch (error) {
    if (storefront.isApiError(error)) {
      return badRequest({
        formError: 'Something went wrong. Please try again later.',
      });
    }

    /**
     * The user did something wrong, but the raw error from the API is not super friendly.
     * Let's make one up.
     */
    return badRequest({
      formError:
        'Sorry. We did not recognize either your email or password. Please try to sign in again or create a new account.',
    });
  }
};

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Login'}];
};

export default function Login() {
  /** @type {LoaderReturnData} */
  const {shopName} = useLoaderData();
  const actionData = useActionData();
  const [nativeEmailError, setNativeEmailError] = useState(null);
  const [nativePasswordError, setNativePasswordError] = useState(null);

  const {t} = useTranslation('login');

  return (
    <div className="flex justify-center my-24 px-4">
      <div className="max-w-md w-full">
        <h1 className="text-4xl">{t('heading')}</h1>
        {/* TODO: Add onSubmit to validate _before_ submission with native? */}
        <Form
          method="post"
          noValidate
          className="pt-6 pb-8 mt-4 mb-4 space-y-3"
        >
          {actionData?.formError && (
            <div className="flex items-center justify-center mb-6 bg-zinc-500">
              <p className="m-4 text-s text-contrast">
                {t('email_password_validate')}
              </p>
            </div>
          )}
          <div>
            <input
              className={`mb-1 ${getInputStyleClasses(nativeEmailError)}`}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder={t('email_placeholder')}
              aria-label="Email address"
              onBlur={(event) => {
                setNativeEmailError(
                  event.currentTarget.value.length &&
                    !event.currentTarget.validity.valid
                    ? `${t('email_format_error')}`
                    : null,
                );
              }}
            />
            {nativeEmailError && (
              <p className="text-red-500 text-xs">{nativeEmailError} &nbsp;</p>
            )}
          </div>

          <div>
            <input
              className={`mb-1 ${getInputStyleClasses(nativePasswordError)}`}
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder={t('password_placeholder')}
              aria-label="Password"
              minLength={8}
              required
              onBlur={(event) => {
                if (
                  event.currentTarget.validity.valid ||
                  !event.currentTarget.value.length
                ) {
                  setNativePasswordError(null);
                } else {
                  setNativePasswordError(
                    event.currentTarget.validity.valueMissing
                      ? `${t('password_empty_error')}`
                      : `${t('password_limit_character_error')}`,
                  );
                }
              }}
            />
            {nativePasswordError && (
              <p className="text-red-500 text-xs">
                {' '}
                {nativePasswordError} &nbsp;
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-primary text-contrast rounded py-2 px-4 focus:shadow-outline block w-full"
              type="submit"
              disabled={!!(nativePasswordError || nativeEmailError)}
            >
              {t('submit_button')}
            </button>
          </div>
          <div className="flex justify-between items-center mt-8 border-t border-gray-300">
            <p className="align-baseline text-sm mt-6">
              {t('new_to_hydrogen')}
              {shopName}? &nbsp;
              <Link className="inline underline" to="/account/register">
                {t('create_account')}
              </Link>
            </p>
            <Link
              className="mt-6 inline-block align-baseline text-sm text-primary/50"
              to="/account/recover"
            >
              {t('forgot_password')}
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}

const LOGIN_MUTATION = `#graphql
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerUserErrors {
        code
        field
        message
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
    }
  }
`;

/**
 * @param {AppLoadContext}
 * @param {{
 *     email: string;
 *     password: string;
 *   }}
 */
export async function doLogin({storefront}, {email, password}) {
  const data = await storefront.mutate(LOGIN_MUTATION, {
    variables: {
      input: {
        email,
        password,
      },
    },
  });

  if (data?.customerAccessTokenCreate?.customerAccessToken?.accessToken) {
    return data.customerAccessTokenCreate.customerAccessToken.accessToken;
  }

  /**
   * Something is wrong with the user's input.
   */
  throw new Error(
    data?.customerAccessTokenCreate?.customerUserErrors.join(', '),
  );
}

/**
 * @typedef {{
 *   formError?: string;
 * }} ActionData
 */

/** @typedef {import('@shopify/remix-oxygen').ActionFunction} ActionFunction */
/** @typedef {import('@shopify/remix-oxygen').AppLoadContext} AppLoadContext */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
