const novelController = require("../controllers/novel_controller");

const router = require("express").Router()

// GET LIST RECOMMEND NOVEL
router.get("/de-cu/danh-sach", novelController.getListRecommendNovel);

// GET NOVEL INFO
router.get("/truyen/:name", novelController.getNovelInfo)

// GET CHAPTER CONTENT
router.get("/:novel/chuong-:chapter", novelController.getChapterContent);

module.exports = router