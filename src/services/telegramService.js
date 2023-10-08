import telegramBot, { isUserAllowed } from "./../config/telegramBot.js";
import {
  parseOLXCategories,
  searchOlxAdvertisements,
  searchOlxAdvertisementsByUrl,
} from "./olxService.js";
import CategoryService from "./CategoryService.js";
import Category from "../models/Category.js";
import ProductService from "./ProductService.js";
import Product from "../models/Product.js";
import UserSubscription from "../models/UserSubscription.js";
import UserSubscriptionService from "./UserSubscriptionService.js";

const productService = new ProductService(new Product().getInstance());
const userSubscriptionService = new UserSubscriptionService(
  new UserSubscription().getInstance()
);
const categoryService = new CategoryService(new Category().getInstance());

telegramBot.on("polling_error", (msg) => console.log(`polling_error:${msg}`));

telegramBot.on("webhook_error", (msg) => console.log(`webhook_error: ${msg}`));

telegramBot.on("error", (error) => {
  if (error.message.includes("socket hang up")) {
    console.log("Socket hang up error occurred:", error);
  } else {
    console.log("Error occurred:", error);
  }
});

telegramBot.on("message", async (msg) => {
  // When add || remove from group, receive strange message 
  if(!msg || !msg.text || msg.text.length === 0) return;

  const userId = msg.from.id;
  const chatId = msg.chat.id;

  let messageText;
  // if chat id < 0 that mean It is group. 
  if(chatId < 0) {
    messageText = msg.text.replace(/@[^ ]+/, '').toLowerCase();
  } else {
    messageText = msg.text.toString().toLowerCase();
  }

  if (!isUserAllowed(userId)) {
    telegramBot.sendMessage(
      chatId,
      "Sorry, you are not authorized to use this bot."
    );
    return;
  }

  switch (messageText) {
    case "/hello":
      return telegramBot.sendMessage(
        chatId,
        `Привіт, ${msg.from.first_name}\nНехай цей день стане найкращим у твоєму житті.`
      );
    case "/add":
      telegramBot.sendMessage(
        chatId,
        "Щоб створити підписку, напишіть,\nнаприклад:\n/add category nike \n/add category air force"
      );
      return;
    case "/delete":
      telegramBot.sendMessage(
        chatId,
        "Щоб видалити підписку, напишіть:\n/delete id"
      );
      return;
    case "/list": {
      try {
        const allUserSubscriptions = await getUserSubscriptionsById(userId);

        const subs = allUserSubscriptions.data.subscription.map(
          ({ category, searchKeyWords }, index) => {
            return `${index}. ${category} ${searchKeyWords}`;
          }
        );

        return telegramBot.sendMessage(
          chatId,
          `👀 Активні підписки:\n${subs.join(
            "\n"
          )}\n\nЩоб видалити підписку, введіть /delete та індекс підписки.\nНаприклад: /delete 1`
        );
      } catch (error) {
        return telegramBot.sendMessage(chatId, error.message);
      }
    }
    case "/categories":
      const categories = await getAvailableSubscriptions();

      return telegramBot.sendMessage(
        chatId,
        `Доступні категорії для підписки:\n\n${categories.join(
          "\n"
        )}\n\np.s. дотримуйтесь правильності написання категорії.`
      );
    case "/update":
      telegramBot.sendMessage(
        chatId,
        `Щоб оновити підписку і получити нові оголошення. Наприклад:\n/update 1, де '1' номер вашой підписки див. /list`
      );
      return;
  }

  const splitMessageText = messageText.split(" ");
  switch (splitMessageText[0]) {
    case "/delete": {
      try {
        const index = splitMessageText[1];

        const allUserSubscriptions = await getUserSubscriptionsById(userId);

        if (
          typeof allUserSubscriptions.data.subscription[index] === "undefined"
        ) {
          return telegramBot.sendMessage(
            chatId,
            "Grammar Nazi, немає такої підписки, спробуй ще раз."
          );
        }

        const result = await userSubscriptionService.RemoveSubscriptionById({
          _id: userId,
          subscriptionId: allUserSubscriptions.data.subscription[index]._id,
        });

        return telegramBot.sendMessage(
          chatId,
          'Підписку було видалено "успішно".'
        );
      } catch (error) {
        return telegramBot.sendMessage(chatId, error.message);
      }
    }
    case "/update": {
      await UpdateUserSubscriptions();
      break;
    }
    case "/update-category": {
      const subCategoryID = splitMessageText.slice(1);

      if (!subCategoryID || subCategoryID.length === 0) {
        return telegramBot.sendMessage(
          chatId,
          "Grammar Nazi, забув написати ID, які будуть парситься в категорії"
        );
      }

      try {
        const newOlxCategories = await parseOLXCategories(subCategoryID);

        await categoryService.insert(newOlxCategories);
      } catch (error) {
        telegramBot.sendMessage(chatId, error.message);
      }
      break;
    }
    case "/add": {
      // ["/add", "category", "search key words"]
      const category = splitMessageText[1]; // "category"
      const searchKeyWords = splitMessageText.slice(2); // array search keyWords ["nike" "air", '']

      const categoryUriPath = await categoryService.get(category);
      if (!categoryUriPath || categoryUriPath.error == true) {
        return telegramBot.sendMessage(
          chatId,
          "Grammar Nazi, категорію введено невірно."
        );
      }

      if (searchKeyWords.length === 0) {
        return telegramBot.sendMessage(
          chatId,
          "Grammar Nazi, забув написати слова для пошуку."
        );
      }

      try {
        const products = await searchOlxAdvertisements(
          categoryUriPath.data.uriPath,
          searchKeyWords
        );

        const productModel = [];
        for (let [key, value] of products.data) {
          productModel.push({ _id: key, userId: userId });
        }

        const res = await productService.insert(productModel);

        if (!res || res.statusCode === 400) {
          throw new Error("Щось запахло смаженим 🔥");
        }

        const userSubscription = {
          _id: userId,
          chatId: chatId,
          subscription: [
            {
              category: category,
              searchKeyWords: searchKeyWords.join(" "),
              searchUri: products.searchURI,
            },
          ],
        };

        await userSubscriptionService.findByIdAndUpdate(userSubscription);

        return telegramBot.sendMessage(
          chatId,
          `Вітаю 🥳, було додано нову підписку:\n ${category} ${searchKeyWords.join(
            " "
          )}`
        );
      } catch (error) {
        return telegramBot.sendMessage(chatId, error.message);
      }
    }
  }
});

const getUserSubscriptionsById = async (userId) => {
  const allUserSubscriptions = await userSubscriptionService.get(userId);

  if (
    !allUserSubscriptions ||
    allUserSubscriptions.error === true ||
    allUserSubscriptions.data.subscription.length === 0
  ) {
    throw new Error("Ти що? - На приколі, не знайдено жодних підписок.");
  }
  return allUserSubscriptions;
};

const getAvailableSubscriptions = async (_) => {
  const categories = await categoryService.getAll();

  return categories.data.map(({ _id }, index) => `${index}. ${_id}`);
};

async function UpdateUserSubscriptionAsync(userId, searchUrl, targetRecipientID) {
  try {
    const updatedProducts = await searchOlxAdvertisementsByUrl(searchUrl, true);

    if (updatedProducts.length == 0) {
      return;
    }

    const newProducts = [];
    for (let [key, value] of updatedProducts.data) {
      const productModel = { _id: key, userId: userId };
      const res = await productService.insert(productModel);

      if (!res || res.statusCode === 409) {
        updatedProducts.data.delete(key);
      } else {
        newProducts.push({ title: value.title, link: value.link });
      }
    }

    if (newProducts.length == 0) {
      return;
    }

    const message = newProducts
      .map((item, index) => `${index}. [${item.title}](${item.link})`)
      .join("\n\n");

    return telegramBot.sendMessage(targetRecipientID, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.log(`userId: ${userId} \n${error.message}`);
  }
}

export async function UpdateUserSubscriptions() {
  const userSubs = await userSubscriptionService.getAll();

  for (const userIndex in userSubs.data) {
    const userId = userSubs.data[userIndex]._id;
    const chatId = userSubs.data[userIndex].chatId;
    for (const subscriptionIndex in userSubs.data[userIndex].subscription) {
      const searchUrl =
        userSubs.data[userIndex].subscription[subscriptionIndex].searchUri;
      await UpdateUserSubscriptionAsync(userId, searchUrl, chatId);
    }
  }
}

export default telegramBot;
