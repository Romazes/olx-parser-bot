import mongoose, { Schema } from "mongoose";

class Category {

    initSchema() {
        const subCategorySchema = new Schema({
            _id: {
                type: String,
                required: true
            },
            uriPath: {
                type: String,
                required: true
            }
        })

        const schema = new Schema ({
            categoryTitle: {
                type: String,
                required: true
            },
            subTitles: [subCategorySchema]
        });

        return mongoose.model("category", schema);
    }

    getInstance() {
        this.initSchema();
        return mongoose.model("category");
    }
}

export default Category;