import axios from "axios";
import { load } from "cheerio";
import { OLX_SEARCH_FILTER_URI_QUERY, OLX_URL } from "../models/olxModel.js";

export const generateSearchOlxUri = (categoryUrlPath, searchKeyWords) => {
  const pathParam = "q-" + searchKeyWords.join("-") + "/";
  const queryParam = "?" + OLX_SEARCH_FILTER_URI_QUERY["new_ones"];

  return new URL(OLX_URL + categoryUrlPath + pathParam + queryParam);
};

export async function searchOlxAdvertisements(
  categoryUrlPath,
  searchKeyWords,
  skipTopAds
) {
  const getUrl = generateSearchOlxUri(categoryUrlPath, searchKeyWords);
  return await searchOlxAdvertisementsByUrl(getUrl.href, skipTopAds);
}

export async function searchOlxAdvertisementsByUrl(url, skipTopAds) {
  const response = await axios.get(url);

  const $ = load(response.data);

  if (getAdvertisementAmount($, '[data-testid="listing-count-msg"]') <= 0) {
    throw new Error("За цими ключовими словами не знайдено оголошень.");
  }

  const data = new Map();
  $('[data-testid="listing-grid"]')
    .children('[data-cy="l-card"]')
    .each((index, element) => {
      const id = $(element).attr("id");
      const link = OLX_URL + $(element).children("a").attr("href");
      const title = $(element).find("h6").text();

      //Do you want skip the Top advertisements ?
      const isTopAd =
        $(element).find('[data-testid="adCard-featured"]').length > 0;
      if (skipTopAds && isTopAd) {
        return;
      }

      data.set(id, { link, title });
    });
  return { searchURI: url, data: data };
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
    const response = await axios.get(OLX_URL);

    const $ = load(response.data);

    const categories = $(`[data-subcategory="${subCategoryId}"]`);

    if (!categories || categories.length === 0) {
      throw new Error(
        `Не було знайденно категорій по данному ID:${subCategoryId}`
      );
    }

    const mainTitle = categories.children().children().attr("href");

    const mainCategoryLink = new URL(mainTitle);

    // see = ./models/Category.js
    const categoriesObj = [
      {
        _id: mainCategoryLink.pathname.split("/")[1],
        uriPath: mainCategoryLink.pathname,
      },
    ];

    categories
      .children("ul")
      .children("li")
      .each((index, element) => {
        if ($(element).hasClass("clear")) {
          return;
        }

        const categoryLink = new URL($(element).find("a").attr("href"));
        const subTitle = categoryLink.pathname.split("/")[2];

        categoriesObj.push({ _id: subTitle, uriPath: categoryLink.pathname });
      });

    return categoriesObj;
  } catch (error) {
    console.log("Failed to retrieve the page:", error.message);
    throw new Error(
      `Не було знайденно категорій по данному ID:${subCategoryId}`
    );
  }
}

function getAdvertisementAmount(loadedDocument, selector) {
  return loadedDocument(selector).children().text().match(/\d+/)[0];
}
