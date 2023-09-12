import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import scrapeOLX from "./olxService.js";
import { getOrderById } from "../models/orderModel.js";

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
    description: "додати підписку за ключовою фразою",
  },
];

const subscriptions = [];

bot.setMyCommands(BOT_COMMANDS);

bot.on("message", (msg) => {
  const userID = msg.from.id;
  const messageText = msg.text.toString().toLowerCase();

  if (!isUserAllowed(userID)) {
    bot.sendMessage(
      msg.chat.id,
      "Sorry, you are not authorized to use this bot."
    );
    return;
  }

  switch (messageText) {
    case "/add":
      bot.sendMessage(
        msg.chat.id,
        "Щоб створити підписку, напишіть,\nнаприклад:\n/add bmw e36\n/add air force кросовки."
      );
      return;
    case "/list":
      const userSubscriptions = subscriptions.find(
        (x) => x.userId === userID
      )?.subscriptions;
      bot.sendMessage(
        msg.chat.id,
        `👀 Активні підписки:\n${userSubscriptions ? userSubscriptions.join("\n") : ""}\nЧтобы удалить подписку, напишите /delete и номер подписки или поисковый запрос.\nНаприклад:\n/delete 4\n/delete Gamedev.\n/delete all удалит все подписки.`
      );
      return;
  }

  if (messageText.startsWith("/add")) {
    const searchKeyWords = messageText.slice(5);
    var index = subscriptions.findIndex((x) => x.userId === userID);
    index === -1
      ? subscriptions.push({ userId: userID, subscriptions: [searchKeyWords] })
      : subscriptions[index].subscriptions.push(searchKeyWords);
    scrapeOLX(searchKeyWords);
  }

  if (!isNaN(messageText)) {
    const order = getOrderById(messageText);
    bot.sendMessage(
      msg.chat.id,
      `orderId: ${order.orderId} | Link: ${order.orderLink}`
    );
  }
});

function isUserAllowed(userId) {
  return allowedUserIds.includes(userId);
}

export default bot;
