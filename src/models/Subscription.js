import mongoose, { Schema } from "mongoose";

class Subscription {
  initSchema() {
    const schema = new Schema({
      category: {
        type: String,
        required: true,
      },
      searchKeyWords: { type: String, required: true },
      searchUri: { type: String, required: true },
    });

    return mongoose.model("subscription", schema);
  }
}

export default Subscription;
