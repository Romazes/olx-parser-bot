import bot, { isUserAllowed } from "./../models/telegramBotModel.js";
import { scrapeOLX, updateOlxAdvertisement } from "./olxService.js";
import { olxCategories } from "../models/olxModel.js";
import {
  createNewSubscription,
  getListSubscriptionByUserId,
  getSubscriptionByUserIdAndIndex,
} from "../models/subscriptionModel.js";

bot.on("message", (msg) => {
  const userID = msg.from.id;
  const messageText = msg.text.toString().toLowerCase();
  const chatId = msg.chat.id;

  if (!isUserAllowed(userID)) {
    bot.sendMessage(chatId, "Sorry, you are not authorized to use this bot.");
    return;
  }

  switch (messageText) {
    case "/add":
      bot.sendMessage(
        chatId,
        "Щоб створити підписку, напишіть,\nнаприклад:\n/add <category> nike \n/add <category> air force"
      );
      return;
    case "/list":
      const userSubscriptions = getListSubscriptionByUserId(userID);

      if (!userSubscriptions) {
        bot.sendMessage(
          chatId,
          "👀 Активні підписки:\nНажаль, немає активних підписок"
        );
        return;
      }

      const temp = [];
      for (let i = 0; i < userSubscriptions.length; i++) {
        temp.push(`${i}. ${userSubscriptions[i].join(" ")}`);
      }

      bot.sendMessage(
        chatId,
        `👀 Активні підписки:\n${
          userSubscriptions ? temp.join("\n") : ""
        }\n\nЧтобы удалить подписку, напишите /delete и номер подписки или поисковый запрос.\nНаприклад:\n/delete 1`
      );
      return;
    case "/categories":
      const categories = Object.keys(olxCategories).join("\n");
      bot.sendMessage(
        chatId,
        `Доступні категорії для підписки:\n\n${categories}\n\np.s. дотримуйтесь правильності написання категорії`
      );
      return;
    case "/update":
      bot.sendMessage(
        chatId,
        `Щоб оновити підписку і получити нові оголошення. Наприклад:\n/update 1, де '1' номер вашой підписки див. /list`
      );
      return;
  }

  if (messageText.startsWith("/update")) {
    const splitMessageText = messageText.split(" ");

    const userSubscription = getSubscriptionByUserIdAndIndex(
      userID,
      splitMessageText[1]
    );

    if (!userSubscription) {
      bot.sendMessage(
        chatId,
        "Grammar Nazi, немає такого індексу або усе зламалося к хуям"
      );
      return;
    }

    const categoryUrlPath = olxCategories[userSubscription[0]];
    const searchKeyWords = userSubscription.slice(1);

    updateOlxAdvertisement(categoryUrlPath, searchKeyWords, true)
      .then((result) => {
        const amountNewOrders = result.length;
        if (amountNewOrders === 0) {
          bot.sendMessage(
            chatId,
            `Немає нових оголошень по ${userSubscription.join(" ")}`
          );
          return;
        }

        const message = result
          .map((item, index) => `${index}. [${item.title}](${item.link})`)
          .join("\n\n");
        bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
      })
      .catch((e) => bot.sendMessage(chatId, e.message));
  }

  if (messageText.startsWith("/add")) {
    // ["/add", "category", "search key words"]
    const splitMessageText = messageText.split(" ");

    const categoryUrlPath = olxCategories[splitMessageText[1]];
    const searchKeyWords = splitMessageText.slice(2);

    if (!categoryUrlPath) {
      bot.sendMessage(chatId, "Grammar Nazi, категорію введено невірно");
      return;
    }

    if (searchKeyWords.length === 0) {
      bot.sendMessage(chatId, "Grammar Nazi, забув написати слова для пошуку");
      return;
    }

    scrapeOLX(categoryUrlPath, searchKeyWords)
      .then((result) => {
        createNewSubscription(userID, splitMessageText.slice(1));
        bot.sendMessage(
          chatId,
          `Успішно було додано ${result} оголошень до бази даних`
        );
      })
      .catch((e) => bot.sendMessage(chatId, e.message));
  }
});

export default bot;
