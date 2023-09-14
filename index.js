import bot, {
  UpdateUserSubscriptions,
} from "./src/services/telegramService.js";
import { scheduleJob } from "node-schedule";

scheduleJob("10 * * * * *", () => {
  console.log("The schedule is started...");
  UpdateUserSubscriptions();
  console.log("The schedule is finished...");
});