const mongoose = require("mongoose")

const chapterDetailSchema = new mongoose.Schema({
    chapterTitle: String,
    chapterText: [String],
    novel: String,
    chapterNumber: String
});

let ChapterDetail = mongoose.model("ChapterDetail", chapterDetailSchema)

module.exports = {ChapterDetail};