import mongoose from "mongoose";

class Connection {
  constructor() {
    const connectionString = process.env.MONGO_DB_CONNECTION_STRING;
    console.log("Establish new connection with url", connectionString);
    mongoose.Promise = global.Promise;
    this.connect(connectionString)
      .then(() => {
        console.log("✔ Database Connected");
      })
      .catch((err) => {
        console.error("✘ MONGODB ERROR: ", err.message);
      });
  }

  async connect(connectionString) {
    try {
      await mongoose.connect(connectionString);
    } catch (e) {
      throw e;
    }
  }
}

// create singleton instance
export default new Connection();
