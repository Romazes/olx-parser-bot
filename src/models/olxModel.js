/**
 * The endpoint of OLX website
 */
export const OLX_URL = "https://www.olx.ua";

/**
 * Add one of param to URI query param to filtering request
 */
export const OLX_SEARCH_FILTER_URI_QUERY = {
  most_expensive: "search%5Border%5D=filter_float_price:desc",
  most_cheep: "search%5Border%5D=filter_float_price:asc",
  new_ones: "search%5Border%5D=created_at:desc",
};
