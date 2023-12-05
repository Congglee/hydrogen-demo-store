import {
  useParams,
  Form,
  Await,
  useMatches,
  useLocation,
} from '@remix-run/react';
import {useWindowScroll} from 'react-use';
import {Disclosure} from '@headlessui/react';
import {Suspense, useEffect, useMemo, useState} from 'react';
import {CartForm, Image} from '@shopify/hydrogen';
import clsx from 'clsx';

import {
  Drawer,
  useDrawer,
  Text,
  Input,
  IconLogin,
  IconAccount,
  IconBag,
  IconSearch,
  Heading,
  IconMenu,
  IconCaret,
  Section,
  CountrySelector,
  TranslateCountrySelector,
  Cart,
  CartLoading,
  Link,
} from '~/components';
import {useIsHomePath} from '~/lib/utils';
import {useIsHydrated} from '~/hooks/useIsHydrated';
import {useCartFetchers} from '~/hooks/useCartFetchers';
import {useRootLoaderData} from '~/root';
import imageUrlBuilder from '@sanity/image-url';

/**
 * @param {LayoutProps}
 */
export function Layout({children, layout}) {
  const {headerMenu, footerMenu, headerMainMenu, accessories} = layout;
  return (
    <>
      <div className="flex flex-col min-h-screen font-sans">
        <div className="">
          <a href="#mainContent" className="sr-only">
            Skip to content
          </a>
        </div>
        {headerMenu && (
          <Header
            title={layout.shop.name}
            menu={headerMenu}
            topMenu={headerMainMenu}
            accessories={accessories}
          />
        )}
        <main role="main" id="mainContent" className="flex-grow">
          {children}
        </main>
      </div>
      {footerMenu && <Footer menu={footerMenu} />}
    </>
  );
}

/**
 * @param {{title: string; menu?: EnhancedMenu}}
 */
function Header({title, menu, topMenu, accessories}) {
  const isHome = useIsHomePath();

  const {
    isOpen: isCartOpen,
    openDrawer: openCart,
    closeDrawer: closeCart,
  } = useDrawer();

  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();

  const addToCartFetchers = useCartFetchers(CartForm.ACTIONS.LinesAdd);

  // toggle cart drawer when adding to cart
  useEffect(() => {
    if (isCartOpen || !addToCartFetchers.length) return;
    openCart();
  }, [addToCartFetchers, isCartOpen, openCart]);

  return (
    <>
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      {menu && (
        <MenuDrawer isOpen={isMenuOpen} onClose={closeMenu} menu={menu} />
      )}
      <DesktopTopHeader
        isHome={isHome}
        menu={topMenu}
        accessories={accessories}
      />
      <DesktopHeader
        isHome={isHome}
        title={title}
        menu={menu}
        openCart={openCart}
      />
      <MobileHeader
        isHome={isHome}
        title={title}
        openCart={openCart}
        openMenu={openMenu}
      />
    </>
  );
}

/**
 * @param {{isOpen: boolean; onClose: () => void}}
 */
function CartDrawer({isOpen, onClose}) {
  const rootData = useRootLoaderData();

  return (
    <Drawer open={isOpen} onClose={onClose} heading="Cart" openFrom="right">
      <div className="grid">
        <Suspense fallback={<CartLoading />}>
          <Await resolve={rootData?.cart}>
            {(cart) => <Cart layout="drawer" onClose={onClose} cart={cart} />}
          </Await>
        </Suspense>
      </div>
    </Drawer>
  );
}

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   menu: EnhancedMenu;
 * }}
 */
export function MenuDrawer({isOpen, onClose, menu}) {
  return (
    <Drawer open={isOpen} onClose={onClose} openFrom="left" heading="Menu">
      <div className="grid">
        <MenuMobileNav menu={menu} onClose={onClose} />
      </div>
    </Drawer>
  );
}

/**
 * @param {{
 *   menu: EnhancedMenu;
 *   onClose: () => void;
 * }}
 */
function MenuMobileNav({menu, onClose}) {
  return (
    <nav className="grid gap-4 p-6 sm:gap-6 sm:px-12 sm:py-8">
      {/* Top level menu items */}
      {(menu?.items || []).map((item) => (
        <span key={item.id} className="block">
          <Link
            to={item.to}
            target={item.target}
            onClick={onClose}
            className={({isActive}) =>
              isActive ? 'pb-1 border-b -mb-px' : 'pb-1'
            }
          >
            <Text as="span" size="copy">
              {item.title}
            </Text>
          </Link>
        </span>
      ))}
    </nav>
  );
}

/**
 * @param {{
 *   title: string;
 *   isHome: boolean;
 *   openCart: () => void;
 *   openMenu: () => void;
 * }}
 */
function MobileHeader({title, isHome, openCart, openMenu}) {
  // useHeaderStyleFix(containerStyle, setContainerStyle, isHome);

  const params = useParams();

  return (
    <header
      role="banner"
      className={`${
        isHome
          ? 'bg-primary/80 dark:bg-contrast/60 text-contrast dark:text-primary shadow-darkHeader'
          : 'bg-contrast/80 text-primary'
      } flex lg:hidden items-center h-nav sticky backdrop-blur-lg z-40 top-0 justify-between w-full leading-none gap-4 px-4 md:px-8`}
    >
      <div className="flex items-center justify-start w-full gap-4">
        <button
          onClick={openMenu}
          className="relative flex items-center justify-center w-8 h-8"
        >
          <IconMenu />
        </button>
        <Form
          method="get"
          action={params.locale ? `/${params.locale}/search` : '/search'}
          className="items-center gap-2 sm:flex"
        >
          <button
            type="submit"
            className="relative flex items-center justify-center w-8 h-8"
          >
            <IconSearch />
          </button>
          <Input
            className={
              isHome
                ? 'focus:border-contrast/20 dark:focus:border-primary/20'
                : 'focus:border-primary/20'
            }
            type="search"
            variant="minisearch"
            placeholder="Search"
            name="q"
          />
        </Form>
      </div>

      <Link
        className="flex items-center self-stretch leading-[3rem] md:leading-[4rem] justify-center flex-grow w-full h-full"
        to="/"
      >
        <Heading
          className="font-bold text-center leading-none"
          as={isHome ? 'h1' : 'h2'}
        >
          {title}
        </Heading>
      </Link>

      <div className="flex items-center justify-end w-full gap-4">
        <AccountLink className="relative flex items-center justify-center w-8 h-8" />
        <CartCount isHome={isHome} openCart={openCart} />
      </div>
    </header>
  );
}

/**
 * @param {{
 *   isHome: boolean;
 *   openCart: () => void;
 *   menu?: EnhancedMenu;
 *   title: string;
 * }}
 */

function DesktopHeader({isHome, menu, openCart, title}) {
  const params = useParams();
  const location = useLocation();
  const {y} = useWindowScroll();

  const {search} = location;
  const isLngAlreadyPresent = search.includes('?lng=');

  return (
    <header
      role="banner"
      className={`${
        isHome
          ? 'bg-primary/80 dark:bg-contrast/60 text-contrast dark:text-primary shadow-darkHeader'
          : 'bg-contrast/80 text-primary'
      } ${
        !isHome && y > 50 && ' shadow-lightHeader'
      } hidden h-nav lg:flex items-center sticky transition duration-300 backdrop-blur-lg z-40 top-0 justify-between w-full leading-none gap-8 px-12 py-8`}
    >
      <div className="flex gap-12">
        <Link
          className="font-bold"
          to={isLngAlreadyPresent ? `/${search}` : '/'}
          prefetch="intent"
        >
          {title}
        </Link>
        <nav className="flex gap-8">
          {/* Top level menu items */}
          {(menu?.items || []).map((item) => (
            <Link
              key={item.id}
              to={isLngAlreadyPresent ? `${item.to}${search}` : item.to}
              target={item.target}
              prefetch="intent"
              className={({isActive}) =>
                isActive ? 'pb-1 border-b -mb-px' : 'pb-1'
              }
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-1">
        <Form
          method="get"
          action={params.locale ? `/${params.locale}/search` : '/search'}
          className="flex items-center gap-2"
        >
          <Input
            className={
              isHome
                ? 'focus:border-contrast/20 dark:focus:border-primary/20'
                : 'focus:border-primary/20'
            }
            type="search"
            variant="minisearch"
            placeholder="Search"
            name="q"
          />
          <button
            type="submit"
            className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
          >
            <IconSearch />
          </button>
        </Form>
        <AccountLink className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5" />
        <CartCount isHome={isHome} openCart={openCart} />
      </div>
    </header>
  );
}

function DesktopTopHeader({isHome, menu, accessories}) {
  const {y} = useWindowScroll();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  return (
    <header
      role="banner"
      className={clsx(
        isHome && 'bg-[#0f172a] text-white',
        !isHome && y > 50 && 'shadow-lightHeader',
        'bg-contrast/80 text-primary',
        'transition duration-300 backdrop-blur-lg z-50 w-full leading-none',
      )}
    >
      <div className="w-full px-12 lg:flex items-center justify-between gap-8 relative">
        <nav className="flex gap-8">
          {(menu || []).map((item, index) => {
            if (item.mainLinkTitle === 'Accessories') {
              return (
                <div
                  className="py-5 cursor-pointer menu-item"
                  key={index}
                  onMouseEnter={() => {
                    setIsDropdownVisible(true);
                  }}
                  onMouseLeave={() => {
                    setIsDropdownVisible(false);
                  }}
                >
                  <Link to={item.to} target={item.target} prefetch="intent">
                    <span className="font-medium text-base block h-6 leading-6 overflow-hidden hover-effect">
                      <span className="block">{item.mainLinkTitle}</span>
                      <span className="hidden lg:block">
                        {item.mainLinkTitle}
                      </span>
                    </span>
                  </Link>

                  {isDropdownVisible && (
                    <AccessoriesMenu
                      accessories={accessories}
                      isHoverMenu={isDropdownVisible}
                    />
                  )}
                </div>
              );
            }

            return (
              <div className="py-5 cursor-pointer menu-item" key={index}>
                <Link to={item.to} target={item.target} prefetch="intent">
                  <span className="font-medium text-base block h-6 leading-6 overflow-hidden hover-effect">
                    <span className="block">{item.mainLinkTitle}</span>
                    <span className="hidden lg:block">
                      {item.mainLinkTitle}
                    </span>
                  </span>
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
            />
          </svg>

          <span>Free shipping for all order over $99.00</span>
        </div>
      </div>
    </header>
  );
}

function AccessoriesMenu({accessories, isHoverMenu}) {
  const [root] = useMatches();

  const {sanityDataset, sanityProjectID} = root.data;

  const builder = imageUrlBuilder({
    projectId: sanityProjectID,
    dataset: sanityDataset,
  });

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-4 sm:grid-cols-2 lg:grid-cols-6 gap-x-4 md:gap-8 px-6 md:px-8 lg:px-12 border-none bg-white py-[31px] absolute z-50 w-full top-full left-0 max-w-full ${
        isHoverMenu ? 'visible opacity-100' : 'invisible opacity-0'
      }`}
    >
      {accessories &&
        accessories.map((accessory) => (
          <div
            className="w-full aspect-[4/5] cursor-pointer"
            key={accessory._key}
          >
            <Image
              data={{
                url: builder.image(accessory.menuBanner.asset._ref).url(),
                altText: null,
              }}
              sizes="(min-width: 45em) 50vw, 100vw"
              aspectRatio="4/5"
              className="object-cover w-full fadeIn mb-5"
            />

            <ul className="text-[#001033]">
              <li className="mb-2 text-lg">
                <span className="font-semibold hover:underline">
                  {accessory.mainLink[0].title}
                </span>
              </li>

              {accessory.subLink.map((link) => (
                <li className="mb-1 text-lg hover:underline" key={link._key}>
                  {link.title}
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}

/**
 * @param {{className?: string}}
 */
function AccountLink({className}) {
  const location = useLocation();
  const rootData = useRootLoaderData();
  const isLoggedIn = rootData?.isLoggedIn;

  const {search} = location;
  const isLngAlreadyPresent = search.includes('?lng=');

  const finalUrl = !isLngAlreadyPresent
    ? `/account/login`
    : `/account/login${search}`;

  return isLoggedIn ? (
    <Link to="/account" className={className}>
      <IconAccount />
    </Link>
  ) : (
    <Link to={finalUrl} className={className}>
      <IconLogin />
    </Link>
  );
}

/**
 * @param {{
 *   isHome: boolean;
 *   openCart: () => void;
 * }}
 */
function CartCount({isHome, openCart}) {
  const rootData = useRootLoaderData();

  return (
    <Suspense fallback={<Badge count={0} dark={isHome} openCart={openCart} />}>
      <Await resolve={rootData?.cart}>
        {(cart) => (
          <Badge
            dark={isHome}
            openCart={openCart}
            count={cart?.totalQuantity || 0}
          />
        )}
      </Await>
    </Suspense>
  );
}

/**
 * @param {{
 *   count: number;
 *   dark: boolean;
 *   openCart: () => void;
 * }}
 */
function Badge({openCart, dark, count}) {
  const isHydrated = useIsHydrated();

  const BadgeCounter = useMemo(
    () => (
      <>
        <IconBag />
        <div
          className={`${
            dark
              ? 'text-primary bg-contrast dark:text-contrast dark:bg-primary'
              : 'text-contrast bg-primary'
          } absolute bottom-1 right-1 text-[0.625rem] font-medium subpixel-antialiased h-3 min-w-[0.75rem] flex items-center justify-center leading-none text-center rounded-full w-auto px-[0.125rem] pb-px`}
        >
          <span>{count || 0}</span>
        </div>
      </>
    ),
    [count, dark],
  );

  return isHydrated ? (
    <button
      onClick={openCart}
      className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
    >
      {BadgeCounter}
    </button>
  ) : (
    <Link
      to="/cart"
      className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
    >
      {BadgeCounter}
    </Link>
  );
}

/**
 * @param {{menu?: EnhancedMenu}}
 */
function Footer({menu}) {
  const isHome = useIsHomePath();
  const itemsCount = menu
    ? menu?.items?.length + 1 > 4
      ? 4
      : menu?.items?.length + 1
    : [];

  return (
    <Section
      divider={isHome ? 'none' : 'top'}
      as="footer"
      role="contentinfo"
      className={`grid min-h-[25rem] items-start grid-flow-row w-full gap-6 py-8 px-6 md:px-8 lg:px-12 md:gap-8 lg:gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-${itemsCount}
        bg-primary dark:bg-contrast dark:text-primary text-contrast overflow-hidden`}
    >
      <FooterMenu menu={menu} />
      {/* <div className="flex flex-col gap-y-16">
        <CountrySelector />
      </div> */}
      <TranslateCountrySelector />
      <div
        className={`self-end pt-8 opacity-50 md:col-span-2 lg:col-span-${itemsCount}`}
      >
        &copy; {new Date().getFullYear()} / Shopify, Inc. Hydrogen is an MIT
        Licensed Open Source project.
      </div>
    </Section>
  );
}

/**
 * @param {{item: ChildEnhancedMenuItem}}
 */
function FooterLink({item}) {
  if (item.to.startsWith('http')) {
    return (
      <a href={item.to} target={item.target} rel="noopener noreferrer">
        {item.title}
      </a>
    );
  }

  return (
    <Link to={item.to} target={item.target} prefetch="intent">
      {item.title}
    </Link>
  );
}

/**
 * @param {{menu?: EnhancedMenu}}
 */
function FooterMenu({menu}) {
  const styles = {
    section: 'grid gap-4',
    nav: 'grid gap-2 pb-6',
  };

  return (
    <>
      {(menu?.items || []).map((item) => (
        <section key={item.id} className={styles.section}>
          <Disclosure>
            {({open}) => (
              <>
                <Disclosure.Button className="text-left md:cursor-default">
                  <Heading className="flex justify-between" size="lead" as="h3">
                    {item.title}
                    {item?.items?.length > 0 && (
                      <span className="md:hidden">
                        <IconCaret direction={open ? 'up' : 'down'} />
                      </span>
                    )}
                  </Heading>
                </Disclosure.Button>
                {item?.items?.length > 0 ? (
                  <div
                    className={`${
                      open ? `max-h-48 h-fit` : `max-h-0 md:max-h-fit`
                    } overflow-hidden transition-all duration-300`}
                  >
                    <Suspense data-comment="This suspense fixes a hydration bug in Disclosure.Panel with static prop">
                      <Disclosure.Panel static>
                        <nav className={styles.nav}>
                          {item.items.map((subItem) => (
                            <FooterLink key={subItem.id} item={subItem} />
                          ))}
                        </nav>
                      </Disclosure.Panel>
                    </Suspense>
                  </div>
                ) : null}
              </>
            )}
          </Disclosure>
        </section>
      ))}
    </>
  );
}

/**
 * @typedef {{
 *   children: React.ReactNode;
 *   layout: LayoutQuery & {
 *     headerMenu?: EnhancedMenu | null;
 *     footerMenu?: EnhancedMenu | null;
 *   };
 * }} LayoutProps
 */

/** @typedef {import('storefrontapi.generated').LayoutQuery} LayoutQuery */
/** @typedef {import('~/lib/utils').EnhancedMenu} EnhancedMenu */
/** @typedef {import('~/lib/utils').ChildEnhancedMenuItem} ChildEnhancedMenuItem */
