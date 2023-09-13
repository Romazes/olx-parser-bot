export const olxURL = "https://www.olx.ua";

/**
 * OLX Categories
 * Format: category = url_path;
 */
export const olxCategories = {
  "moda-i-stil": "/moda-i-stil/",
  "zhenskaya-odezhda": "/moda-i-stil/zhenskaya-odezhda/",
  "zhenskaya-obuv": "/moda-i-stil/zhenskaya-obuv/",
  "muzhskaya-odezhda": "/moda-i-stil/muzhskaya-odezhda/",
  "muzhskaya-obuv": "/moda-i-stil/muzhskaya-obuv/",
  "zhenskoe-bele-kupalniki": "/moda-i-stil/zhenskoe-bele-kupalniki/",
  "muzhskoe-bele-plavki": "/moda-i-stil/muzhskoe-bele-plavki/",
  "golovnye-ubory": "/moda-i-stil/golovnye-ubory/",
  "dlya-svadby": "/moda-i-stil/dlya-svadby/",
  "naruchnye-chasy": "/moda-i-stil/naruchnye-chasy/",
  "aksessuary" : "/moda-i-stil/aksessuary/",
  "odezhda-dlya-beremennyh": "/moda-i-stil/odezhda-dlya-beremennyh/",
  "krasota-zdorove": "/moda-i-stil/krasota-zdorove/",
  "podarki" : "/moda-i-stil/podarki/",
  "spetsodezhda-i-spetsobuv": "/moda-i-stil/spetsodezhda-i-spetsobuv/",
  "moda-raznoe": "/moda-i-stil/moda-raznoe/",
};

export const olxSearchFilter = {
  most_expensive: "search%5Border%5D=filter_float_price:desc",
  most_cheep: "search%5Border%5D=filter_float_price:asc",
  new_ones: "search%5Border%5D=created_at:desc"
}