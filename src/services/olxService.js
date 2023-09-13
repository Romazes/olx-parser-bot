import axios from "axios";
import { load } from "cheerio";
import { createOrder } from "../models/orderModel.js";
import { olxURL } from "../models/olxModel.js";

// Function to fetch and parse the page
export async function scrapeOLX(search) {
  try {
    // Send an HTTP GET request to the URL
    const queryParam = "/list/q-" + search.trim().replace(" ", "-");
    const response = await axios.get(olxURL + queryParam);

    // Load the HTML content into Cheerio
    const $ = load(response.data);

    // Find all the user ads on the page (adjust the HTML structure as needed)
    const userAds = $('[data-testid="listing-grid"]');

    const amountPages = $('[data-testid="pagination-wrapper"]')
      .children("ul")
      .children("li")
      .last()
      .text();

    return;

    // Loop through the user ads and extract relevant information
    userAds.children('[data-cy="l-card"]').each((index, element) => {
      const orderId = $(element).attr("id");
      const orderLink = url + $(element).children("a").attr("href");
      const orderTitle = $(element).find("h6").text();

      createOrder({ orderId, orderLink, orderTitle });
    });
    console.log("Finished successfully");
  } catch (error) {
    console.error("Failed to retrieve the page:", error.message);
  }
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
        const subTitle = categoryLink.pathname.split('/')[2];
        console.log(`"${subTitle}" : "${categoryLink.pathname}"`);
      });
  } catch (error) {
    console.error("Failed to retrieve the page:", error.message);
  }
}
