import mongoose, { Schema } from "mongoose";

class Category {

    initSchema() {
        const schema = new Schema ({
            _id: {
                type: String,
                required: true
            },
            uriPath: {
                type: String,
                required: true
            }
        });

        return mongoose.model("category", schema);
    }

    getInstance() {
        this.initSchema();
        return mongoose.model("category");
    }
}

export default Category;