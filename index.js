import express from "express";
import bot from "./src/models/telegramBotModel.js";
import { UpdateUserSubscriptions } from "./src/services/telegramService.js";
import { scheduleJob } from "node-schedule";
import { cleanAncientProductsByCategory } from "./src/models/productModel.js";

const app = express();

app.use(express.json());

app.get("/", function (req, res) {
  res.send("The Node.js with Express and node-schedule - telegram bot app");
});

const scheduleTask = scheduleJob("* * * * *", () => {
  UpdateUserSubscriptions();
});

const scheduleTask2 = scheduleJob("0 */1 * * *", () => {
  cleanAncientProductsByCategory();
});

const server = app.listen(process.env.PORT, "0.0.0.0", () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log("Web server started at http://%s:%s", host, port);
});

app.post(`/${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});
