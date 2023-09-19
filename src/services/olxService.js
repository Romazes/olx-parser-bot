import axios from "axios";
import { load } from "cheerio";
import { createOrder, getOrderByOrderId, getOrdersLength } from "../models/orderModel.js";
import { olxSearchFilter, olxURL } from "../models/olxModel.js";

export async function updateOlxAdvertisement(categoryUrlPath, searchKeyWords, skipTopAds) {
  const pathParam = "q-" + searchKeyWords.join("-") + "/";
  const queryParam = "?" + olxSearchFilter["new_ones"];
  const response = await axios.get(
    olxURL + categoryUrlPath + pathParam + queryParam
  );

  const $ = load(response.data);

    const userAds = $('[data-testid="listing-grid"]');

    const newOrders = [];
    userAds.children('[data-cy="l-card"]').each((index, element) => {
      const orderId = $(element).attr("id");
      const orderLink = olxURL + $(element).children("a").attr("href");
      const orderTitle = $(element).find("h6").text();

      //Do you want skip the Top ad ?
      const isTopAd = $(element).find('[data-testid="adCard-featured"]').length > 0;
      if(skipTopAds && isTopAd) {
        return;
      }

      if(!getOrderByOrderId(orderId) && (skipTopAds && !isTopAd)) {
        const newOrder = createOrder({ orderId, orderLink, orderTitle });
        newOrders.push(newOrder);
      }

    });
  
    return newOrders;
}

export async function scrapeOLX(categoryUrlPath, searchKeyWords) {
  const pathParam = "q-" + searchKeyWords.join("-") + "/";
  const queryParam = "?" + olxSearchFilter["new_ones"];
  const response = await axios.get(
    olxURL + categoryUrlPath + pathParam + queryParam
  );

  const $ = load(response.data);

  const amountUserAds = $('[data-testid="listing-count-msg"]')
    .children()
    .text()
    .match(/\d+/);

  if (amountUserAds[0] <= 0) {
    throw new Error("За цими ключовими словами не знайдено оголошень");
  }

  const userAds = $('[data-testid="listing-grid"]');

  userAds.children('[data-cy="l-card"]').each((index, element) => {
    const orderId = $(element).attr("id");
    const orderLink = olxURL + $(element).children("a").attr("href");
    const orderTitle = $(element).find("h6").text();

    createOrder({ orderId, orderLink, orderTitle });
  });

  return getOrdersLength();
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
    console.error("Failed to retrieve the page:", error.message);
  }
}
