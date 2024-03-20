const fashionController = require("./fashion_controller")

const router = require("express").Router()

// GET LISTT NOVEL BY TITLE
router.get("/get/fashion", fashionController.getFashionData);

// POST DATA TO MONGODB
router.post("/post/fashion", fashionController.postFashionData);


module.exports = router