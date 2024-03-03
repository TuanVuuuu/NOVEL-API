const novelController = require("../controllers/novel_controller");
const chapterController = require("../controllers/chapter_controller");
const mongodbController = require("../controllers/mongodb_controller");

const router = require("express").Router()

// GET LIST RECOMMEND NOVEL
router.get("/de-cu/danh-sach", novelController.getListRecommendNovel);

// GET LIST RECOMMEND NOVEL
router.get("/de-cu/danh-sach/top", novelController.getListTopNovel);

// GET NOVEL INFO
router.get("/truyen/:name", novelController.getNovelInfo)

// GET CHAPTER CONTENT
router.get("/:novel/chuong-:chapter", chapterController.getChapterContent);



///MONGODB
// GET LIST NOVEL RECOMMEND FROM MONGODB
router.get("/novel/de-cu/danh-sach/page-:page", mongodbController.getNovelListRecommentFromMongoDB);

// GET LIST NOVEL top FROM MONGODB
router.get("/novel/de-cu/danh-sach/top/page-:page", mongodbController.getNovelListTopFromMongoDB);

// GET NOVEL INFO FROM MONGODB
router.get("/novel/:name", mongodbController.getNovelInfoFromMongoDB);

// GET CHAPTER CONTENT
router.get("/novel/:novel/chuong-:chapter", mongodbController.getChapterContentFromMongoDB);

// GET LISTT NOVEL BY TITLE
router.get("/novel/search/:title/page-:page", mongodbController.searchByTitle);

module.exports = router