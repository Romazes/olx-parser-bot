import mongoose, { Schema } from "mongoose";

class Product {
  initSchema() {
    const schema = new Schema({
      _id: {
        type: Number,
        required: true,
      },
      userId: {
        type: Number,
        required: true,
      },
    });

    mongoose.model("product", schema);
  }

  getInstance() {
    this.initSchema();
    return mongoose.model("product");
  }
}

export default Product;
