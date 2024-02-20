const mongoose = require('mongoose');

// 1. Định nghĩa mô hình (model) cho dữ liệu novel.
const novelDetailSchema = new mongoose.Schema({
    title: String,
    author: String,
    status: String,
    genres: [String],
    chapters: String,
    chaptersPerWeek: String,
    views: String,
    bookmarked: String,
    rating: String,
    ratingCount: String,
    description: [String],
    chapterLatest: [{
        chapterTitle: String,
        chapterLink: String,
        chapterTime: String
    }],
    chapterList: [{
        index: Number,
        chapterTitle: String,
        chapterLink: String,
        chapterTime: String
    }],
    href: String
});

const NovelDetail = mongoose.model('NovelDetail', novelDetailSchema);

module.exports = NovelDetail;