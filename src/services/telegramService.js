import telegramBot, { isUserAllowed } from "./../config/telegramBot.js";
import {
  parseOLXCategories,
  searchOlxAdvertisements,
  updateOlxAdvertisement,
} from "./olxService.js";
import { olxCategories } from "../models/olxModel.js";
import {
  createNewSubscription,
  deleteSubscriptionByUserIdAndIndex,
  getAllUserSubscriptions,
  getListSubscriptionByUserId,
  getSubscriptionByUserIdAndIndex,
} from "../models/subscriptionModel.js";
import { createNewProduct, deleteProductsByUserIdByCategoryBySearchKeyWords, getProductById } from "../models/productModel.js";
import CategoryService from "./CategoryService.js";
import Category from "../models/Category.js";
const categoryService = new CategoryService(new Category().getInstance());

telegramBot.on("polling_error", (msg) => console.log(`polling_error:${msg}`));

telegramBot.on("webhook_error", (msg) => console.log(`webhook_error: ${msg}`));

telegramBot.on('error', (error) => {
  if (error.message.includes('socket hang up')) {
    console.log('Socket hang up error occurred:', error);
  } else {
    console.log('Error occurred:', error);
  }
});

telegramBot.on("message", async (msg) => {
  const userId = msg.from.id;
  const messageText = msg.text.toString().toLowerCase();
  const chatId = msg.chat.id;

  if (!isUserAllowed(userId)) {
    telegramBot.sendMessage(chatId, "Sorry, you are not authorized to use this bot.");
    return;
  }

  switch (messageText) {
    case "/hello":
      return telegramBot.sendMessage(
        userId,
        `Привіт, ${msg.from.first_name}\nНехай цей день стане найкращим у твоєму житті.`
      );
    case "/add":
      telegramBot.sendMessage(
        chatId,
        "Щоб створити підписку, напишіть,\nнаприклад:\n/add category nike \n/add category air force"
      );
      return;
    case "/delete":
      telegramBot.sendMessage(chatId, "Щоб видалити підписку, напишіть:\n/delete <id>");
      return;
    case "/list":
      const userSubscriptions = getListSubscriptionByUserId(userId);

      if (!userSubscriptions || userSubscriptions.length === 0) {
        telegramBot.sendMessage(
          chatId,
          "👀 Активні підписки:\nНажаль, немає активних підписок"
        );
        return;
      }

      const temp = [];
      for (let i = 0; i < userSubscriptions.length; i++) {
        temp.push(`${i}. ${userSubscriptions[i].join(" ")}`);
      }

      telegramBot.sendMessage(
        chatId,
        `👀 Активні підписки:\n${
          userSubscriptions ? temp.join("\n") : ""
        }\n\nЧтобы удалить подписку, напишите /delete и номер подписки или поисковый запрос.\nНаприклад:\n/delete 1`
      );
      return;
    case "/categories":
      const categories = Object.keys(olxCategories).join("\n");
      telegramBot.sendMessage(
        chatId,
        `Доступні категорії для підписки:\n\n${categories}\n\np.s. дотримуйтесь правильності написання категорії`
      );
      return;
    case "/update":
      telegramBot.sendMessage(
        chatId,
        `Щоб оновити підписку і получити нові оголошення. Наприклад:\n/update 1, де '1' номер вашой підписки див. /list`
      );
      return;
  }

  const splitMessageText = messageText.split(" ");
  switch (splitMessageText) {
    case "/delete": {
      const userSubscription = getSubscriptionByUserIdAndIndex(
        userId,
        splitMessageText[1]
      );

      if (!userSubscription) {
        return telegramBot.sendMessage(
          chatId,
          "Grammar Nazi, немає такої підписки, спробуй ще раз."
        );
      }

      const isProductsListRemoved =
        deleteProductsByUserIdByCategoryBySearchKeyWords(
          userId,
          userSubscription[0],
          userSubscription[1]
        );
      const isSubscriptionRemoved = deleteSubscriptionByUserIdAndIndex(
        userId,
        splitMessageText[1]
      );

      return telegramBot.sendMessage(
        chatId,
        `Підписку було видалено ${
          isSubscriptionRemoved && isProductsListRemoved
            ? "успішно"
            : "не успішно (спробуйте ще раз)"
        }`
      );
    }
    case "/update":
      {
        const userSubscription = getSubscriptionByUserIdAndIndex(
          userId,
          splitMessageText[1]
        );

        if (!userSubscription) {
          telegramBot.sendMessage(
            chatId,
            "Grammar Nazi, немає такого індексу або усе зламалося к хуям"
          );
          return;
        }

        UpdateUserSubscriptionAsync(chatId, userSubscription);
        break;
      }
    case "/update-category":
      {
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
  }

  if (messageText.startsWith("/add")) {
    // ["/add", "category", "search key words"]
    const category = splitMessageText[1];
    const searchKeyWords = splitMessageText.slice(2);

    const categoryUrlPath = olxCategories[category];

    if (!categoryUrlPath) {
      telegramBot.sendMessage(chatId, "Grammar Nazi, категорію введено невірно");
      return;
    }

    if (searchKeyWords.length === 0) {
      telegramBot.sendMessage(chatId, "Grammar Nazi, забув написати слова для пошуку");
      return;
    }

    try {
      const products = await searchOlxAdvertisements(
        categoryUrlPath,
        searchKeyWords
      );

      products.forEach(({ id, link, title }) =>
        createNewProduct(userId, category, searchKeyWords, { id, link, title })
      );

      const categorySearchKeyWords = splitMessageText.slice(1);

      createNewSubscription(userId, categorySearchKeyWords);

      telegramBot.sendMessage(
        chatId,
        `Успішно було додано підписку\n${categorySearchKeyWords.join(" ")}`
      );
    } catch (error) {
      if (error.message == "За цими ключовими словами не знайдено оголошень") {
        telegramBot.sendMessage(userId, error.message);
      } else {
        console.log(
          `userId: ${userId} msg: ${messageText}\n${error.message}`
        );
      }
    }
  }

});

async function UpdateUserSubscriptionAsync(userId, userSubscription) {
  const categoryUrlPath = olxCategories[userSubscription[0]];
  const searchKeyWords = userSubscription.slice(1);

  try {
    const updatedProducts = await updateOlxAdvertisement(
      categoryUrlPath,
      searchKeyWords,
      true
    );

    if (updatedProducts.length == 0) {
      return;
    }

    const newProduct = [];

    for (let i = 0; i < updatedProducts.length; i++) {
      if (!getProductById(userId, userSubscription[0], searchKeyWords, updatedProducts[i].id)) {
        const { id, link, title } = updatedProducts[i];
        newProduct.push(
          createNewProduct(
            userId,
            userSubscription[0],
            searchKeyWords,
            { id, link, title },
            true
          )
        );
      }
    }

    if (newProduct.length == 0) {
      return;
    }

    const message = newProduct
      .map((item, index) => `${index}. [${item.title}](${item.link})`)
      .join("\n\n");
    return telegramBot.sendMessage(userId, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.log(`userId: ${userId} \n${error.message}`);
  }
}

export function UpdateUserSubscriptions() {
  const usersSubs = getAllUserSubscriptions();

  for (const userId in usersSubs) {
    const userSubscriptions = usersSubs[userId];
    for (const prop in userSubscriptions) {
      if (userSubscriptions[prop].length > 0) {
        userSubscriptions[prop].forEach(async (subs) => {
          await UpdateUserSubscriptionAsync(userId, subs);
        });
      }
    }
  }
}

export default telegramBot;
