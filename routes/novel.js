const novelController = require("../controllers/novel_controller");

const router = require("express").Router()

// GET NOVEL CHAPTERS
router.get("/:novel/page-:page", novelController.getNovelChapters);

module.exports = router