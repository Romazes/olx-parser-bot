import autoBind from "auto-bind";
import Service from "../../system/services/Service.js";

class UserSubscriptionService extends Service {
  constructor(model) {
    super(model);
    this.model = model;
    autoBind(this);
  }

  async findByIdAndUpdate(data) {
    try {
      const item = await this.model.findByIdAndUpdate(
        data._id,
        {
          chatId: data.chatId,
          $push: {
            subscription: {
              category: data.subscription[0].category,
              searchKeyWords: data.subscription[0].searchKeyWords,
              searchUri: data.subscription[0].searchUri,
            },
          },
        },
        { safe: true, upsert: true }
      );

      if (item) {
        return { error: false, item };
      }
      throw new Error("Something wrong happened");
    } catch (error) {
      return { error: true, statusCode: 400, error };
    }
  }

  async RemoveSubscriptionById(data) {
    try {
      const item = await this.model.findByIdAndUpdate(data._id, {
        $pull: {
          subscription: { _id: data.subscriptionId },
        },
      });

      if (item) {
        return { error: false, item };
      }
      throw new Error("Something wrong happened");
    } catch (error) {
      console.error(
        `UserSubscriptionService:RemoveSubscriptionById: userId:${data._id}, subscriptionId:${data.subscriptionId}
        message: ${error.message}`
      );
      throw new Error(
        "Щось пішло не по плану, зверніться будь-ласка до Адміна."
      );
    }
  }
}

export default UserSubscriptionService;
