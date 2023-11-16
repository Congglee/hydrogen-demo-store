import groq from 'groq';

import {MAIN_LINK_TITLES} from './mainLinkTitles';

export const MAIN_LINKS_QUERY = groq`
  *[_type == 'menu'] | order(position asc) {
    ${MAIN_LINK_TITLES}
  }
`;
