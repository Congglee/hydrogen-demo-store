export const API_URL = 'https://theme.truestorefront.com';

export default async function StrapiClient(query, variables) {
  const URL = `${API_URL}/graphql`;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  };

  try {
    const data = await fetch(URL, options).then((response) => {
      return response.json();
    });
    return data;
  } catch (error) {
    throw new Error(`Data fail to fetch`);
  }
}
