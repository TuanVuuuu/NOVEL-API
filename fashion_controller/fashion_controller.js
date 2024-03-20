// fashionController.js
const mongoose = require('mongoose');
const FashionItem = require('./fashion_schema'); 

const fashionController = {
    // GET FASHION DATA
    getFashionData: async (req, res) => {
        try {
            const fashionData = await FashionItem.find();
            res.status(200).json(fashionData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error: " + error.name });
        }
    }, 

    postFashionData: async (req, res) => {
        try {
            const { name, overview, price, imageUrls, description } = req.body;
    
            const newFashionItem = new FashionItem({
                name,
                overview,
                price,
                imageUrls,
                description
            });
    
            await newFashionItem.save();
    
            res.status(201).json({ message: "Fashion item created successfully", data: newFashionItem });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error: " + error.message });
        }
    }
}

module.exports = fashionController;
