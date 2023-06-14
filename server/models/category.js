const { ObjectId } = require("mongoose");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            max: 32,
        },
        slug: {
            type: String,
            lowercase: true,
            trim: true,
            unique: true,
            index: true,
        },
        image: {
            url: String,
            key: String,
        },
        content: {
            type: {},
            min: 20,
            max: 1000000,
        },
        postedBy: {
            type: ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
