const mongoose = require('mongoose');

const fashionItemSchema = new mongoose.Schema({
    name: String,
    overview: String,
    price: Number,
    imageUrls: [String], 
    description: String
});

const FashionItem = mongoose.model('FashionItem', fashionItemSchema);

module.exports = FashionItem;
