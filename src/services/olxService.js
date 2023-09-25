import axios from "axios";
import { load } from "cheerio";
import { olxSearchFilter, olxURL } from "../models/olxModel.js";

export async function updateOlxAdvertisement(
  categoryUrlPath,
  searchKeyWords,
  skipTopAds
) {
  const pathParam = "q-" + searchKeyWords.join("-") + "/";
  const queryParam = "?" + olxSearchFilter["new_ones"];
  const response = await axios.get(
    olxURL + categoryUrlPath + pathParam + queryParam
  );

  const $ = load(response.data);

  const userAds = $('[data-testid="listing-grid"]');

  const products = [];
  userAds.children('[data-cy="l-card"]').each((index, element) => {
    const id = $(element).attr("id");
    const link = olxURL + $(element).children("a").attr("href");
    const title = $(element).find("h6").text();

    //Do you want skip the Top ad ?
    const isTopAd =
      $(element).find('[data-testid="adCard-featured"]').length > 0;
    if (skipTopAds && isTopAd) {
      return;
    }

    products.push({ id, link, title });
  });

  return products;
}

export async function searchOlxAdvertisements(categoryUrlPath, searchKeyWords) {
  const pathParam = "q-" + searchKeyWords.join("-") + "/";
  const queryParam = "?" + olxSearchFilter["new_ones"];
  const response = await axios.get(
    olxURL + categoryUrlPath + pathParam + queryParam
  );

  const $ = load(response.data);

  if (getAdvertisementAmount($, '[data-testid="listing-count-msg"]') <= 0) {
    throw new Error("За цими ключовими словами не знайдено оголошень");
  }

  const products = [];
  $('[data-testid="listing-grid"]').children('[data-cy="l-card"]').each((index, element) => {
    const id = $(element).attr("id");
    const link = olxURL + $(element).children("a").attr("href");
    const title = $(element).find("h6").text();

    products.push({ id, link, title });
  });
  return products;
}

/**
 * Parse categories list by ID from OLX
 *
 * @param {number} subCategoryId
 *
 * @example
 * subCategoryID = 891 // moda i stil category
 */
export async function parseOLXCategories(subCategoryId) {
  try {
    const response = await axios.get(olxURL);

    const $ = load(response.data);

    const categories = $(`[data-subcategory="${subCategoryId}"]`);

    const mainTitle = categories.children().children().attr("href");

    console.log(`mainTitle link: ${mainTitle}`);

    categories
      .children("ul")
      .children("li")
      .each((index, element) => {
        if ($(element).hasClass("clear")) {
          return;
        }

        const categoryLink = new URL($(element).find("a").attr("href"));
        const subTitle = categoryLink.pathname.split("/")[2];
        console.log(`"${subTitle}" : "${categoryLink.pathname}"`);
      });
  } catch (error) {
    console.log("Failed to retrieve the page:", error.message);
  }
}

function getAdvertisementAmount(loadedDocument, selector) {
  return loadedDocument(selector).children().text().match(/\d+/)[0];
}
