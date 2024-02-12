const novelController = require("../controllers/novel_controller");

const router = require("express").Router()

// GET LIST NOVEL
router.get("/", novelController.getListNewNovel);

//GET NOVEL DETAIL
router.get('/:novel', novelController.getNovelDetail)

// GET NOVEL CHAPTERS
router.get("/:novel/page-:page", novelController.getNovelChapters);

// GET CHAPTER CONTENT
router.get("/:novel/chuong-:chapter", novelController.getChapterContent);

module.exports = router