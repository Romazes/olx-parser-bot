import TelegramBot from "node-telegram-bot-api";

let telegramBot;

if (process.env.NODE_ENV === "production") {
  telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
  telegramBot.setWebHook(
    process.env.HEROKU_URL + process.env.TELEGRAM_BOT_TOKEN
  );
} else {
  telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: true,
  });
}

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
  {
    command: "update",
    description: "Оновити підписку по ід",
  },
  {
    command: "delete",
    description: "Видалити підписку по ід",
  },
];

await telegramBot.setMyCommands(BOT_COMMANDS);

function isUserAllowed(userId) {
  return allowedUserIds.includes(userId);
}

export { telegramBot as default, isUserAllowed };
