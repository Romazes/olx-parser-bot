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

export default scrapeOLX;
