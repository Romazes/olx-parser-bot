import "dotenv/config";
import './src/config/database.js';
import server from "./src/config/server.js";
import telegramBot from "./src/config/telegramBot.js";
import { UpdateUserSubscriptions } from "./src/services/telegramService.js";
import { scheduleJob } from "node-schedule";

const PORT = process.env.PORT || 3000;

server.get("/", function (req, res) {
  res.send("The Node.js with Express and node-schedule - telegram bot app");
});

const scheduleTask = scheduleJob("* * * * *", async () => {
  await UpdateUserSubscriptions();
});

server
  .listen(PORT)
  .on("error", (err) => {
    console.log("✘ Application failed to start");
    console.error("✘", err.message);
    process.exit(0);
  })
  .on("listening", () => {
    console.log("✔ Application Started");
  });

server.post(`/${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
  telegramBot.processUpdate(req.body);
  res.sendStatus(200);
});
