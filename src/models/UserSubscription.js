import mongoose, { Schema } from "mongoose";
import Subscription from "./Subscription.js";

class UserSubscription {
  initSchema() {
    const schema = new Schema({
      _id: {
        type: Number,
        require: true,
      },
      chatId: {
        type: Number
      },
      subscription: [
        {
          type: new Subscription().initSchema().schema,
          required: true,
        },
      ],
    });

    mongoose.model("userSubscription", schema);
  }

  getInstance() {
    this.initSchema();
    return mongoose.model("userSubscription");
  }
}

export default UserSubscription;
