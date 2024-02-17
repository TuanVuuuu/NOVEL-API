const novelController = require("../controllers/novel_controller");

const router = require("express").Router()

// GET LIST NOVEL
router.get("/danh-sach", novelController.getListNovel);

// GET NOVEL INFO
router.get("/truyen/:name", novelController.getNovelInfo)

// GET CHAPTER CONTENT
router.get("/:novel/chuong-:chapter", novelController.getChapterContent);

module.exports = router