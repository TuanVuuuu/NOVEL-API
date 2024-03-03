const mongoose = require("mongoose");

const novelTopSchema = new mongoose.Schema({
    title: String,
    image: String,
    description: [String],
    author: String,
    genre: String,
    genre: String,
    href: String,
    updatedAt: { type: Date, default: Date.now },
    rank: Number
});

novelTopSchema.index({ title: 'text' });

const NovelListTop = mongoose.model("NovelListTop", novelTopSchema);

module.exports = NovelListTop;
