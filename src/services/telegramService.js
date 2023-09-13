import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import scrapeOLX from "./olxService.js";
import { getOrderById } from "../models/orderModel.js";
import { olxCategories } from "../models/olxModel.js";

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const allowedUserIds = process.env.TELEGRAM_BOT_ID_RESTRICT_LIST;

const BOT_COMMANDS = [
  {
    command: "hello",
    description: "Вітання",
  },
  {
    command: "list",
    description: "Список активних підписок",
  },
  {
    command: "add",
    description: "Додати підписку за ключовою фразою",
  },
  {
    command: "categories",
    description: "Список доступник категорій для підписки",
  },
];

const subscriptions = [];

await bot.setMyCommands(BOT_COMMANDS);

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
      const userSubscriptions = subscriptions.find(
        (x) => x.userId === userID
      )?.subscriptions;
      bot.sendMessage(
        chatId,
        `👀 Активні підписки:\n${
          userSubscriptions ? userSubscriptions.join("\n") : ""
        }\nЧтобы удалить подписку, напишите /delete и номер подписки или поисковый запрос.\nНаприклад:\n/delete 4\n/delete Gamedev.\n/delete all удалит все подписки.`
      );
      return;
    case "/categories":
      const categories = Object.keys(olxCategories).join("\n");
      bot.sendMessage(
        chatId,
        `Доступні категорії для підписки:\n\n${categories}\n\np.s. дотримуйтесь правильності написання категорії`
      );
      return;
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

    // ADD to temp subscriptions array
    var index = subscriptions.findIndex((x) => x.userId === userID);
    index === -1
      ? subscriptions.push({ userId: userID, subscriptions: [searchKeyWords] })
      : subscriptions[index].subscriptions.push(searchKeyWords);

    scrapeOLX(categoryUrlPath, searchKeyWords)
      .then((result) =>
        bot.sendMessage(
          chatId,
          `Успішно було додано ${result} оголошень до бази даних`
        )
      )
      .catch((e) => bot.sendMessage(chatId, e.message));
  }

  if (!isNaN(messageText)) {
    const order = getOrderById(messageText);
    bot.sendMessage(
      chatId,
      `orderId: ${order.orderId} | Link: ${order.orderLink}`
    );
  }
});

function isUserAllowed(userId) {
  return allowedUserIds.includes(userId);
}

export default bot;
