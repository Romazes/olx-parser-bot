import axios from "axios";
import { load } from "cheerio";
import { createOrder, getOrderByOrderId, getOrdersLength } from "../models/orderModel.js";
import { olxSearchFilter, olxURL } from "../models/olxModel.js";

export async function updateOlxAdvertisement(categoryUrlPath, searchKeyWords) {
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

    const userAds = $('[data-testid="listing-grid"]');

    let counter = 0;
    userAds.children('[data-cy="l-card"]').each((index, element) => {
      const orderId = $(element).attr("id");
      const orderLink = olxURL + $(element).children("a").attr("href");
      const orderTitle = $(element).find("h6").text();

      if(getOrderByOrderId(orderId)) {
        console.log(`Order exist by ID: ${orderId}`);
      }
      else {
        createOrder({ orderId, orderLink, orderTitle });
        counter++;
      }
    });
  
    return counter;
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

  // TODO: should I add this ?
  // queryParam: page=
  // const amountPages = $('[data-testid="pagination-wrapper"]')
  //   .children("ul")
  //   .children("li")
  //   .last()
  //   .text();

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
