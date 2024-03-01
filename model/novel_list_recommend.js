const mongoose = require("mongoose");

const novelSchema = new mongoose.Schema({
    title: String,
    image: String,
    description: [String],
    author: String,
    chapters: String,
    genre: String,
    href: String,
    updatedAt: { type: Date, default: Date.now } 
});

novelSchema.index({ title: 'text' });

const NovelListRecommend = mongoose.model("NovelListRecommend", novelSchema);

module.exports = NovelListRecommend;
