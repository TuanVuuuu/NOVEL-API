const puppeteer = require('puppeteer');
const router = require("express").Router()
const novelController = require("./novel_controller");
const NovelListRecommend = require('../model/novel_list_recommend');
const NovelDetail = require('../model/novel_detail_model');
const { ChapterDetail } = require('../model/chapter_detail_model');
const chapterController = require('./chapter_controller');
require('dotenv').config();

const mongodbController = {
    // GET LIST RECOMMEND NOVEL FROM MONGODB
    getNovelListRecommentFromMongoDB: async (req, res) => {
        try {
            const perPage = 20;
            console.log('API : getNovelListRecommentFromMongoDB')
            const novels = await NovelListRecommend.find({})
                .sort({ updatedAt: -1 }) // Sắp xếp theo thời gian cập nhật mới nhất
                .skip((req.page - 1) * perPage)
                .limit(perPage);

            if (novels.length === 0) {
                res.status(404).json({
                    status: 404,
                    message: 'Not Found'
                });
            } else {
                console.log('Novel length: ' + novels.length)
                res.status(200).json(novels);
            }


        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error: " + error.name });
        }
    },



    // GET NOVEL INFO FROM MONGODB
    getNovelInfoFromMongoDB: async (req, res) => {
        try {
            console.log('API : getNovelInfoFromMongoDB')
            console.log('params: ' + req.params.name)
            const novel = await NovelDetail.findOne({ href: req.params.name });
            if (!novel) {
                console.log('Novel ' + req.params.name + ' not found')
                await novelController.getNovelInfo(req, res);
            } else {
                res.status(200).json([novel]);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error: " + error.name });
        }
    },

    // Lấy thông tin của một tiểu thuyết từ MongoDB dựa trên slug của tiểu thuyết
    getChapterContentFromMongoDB: async (req, res) => {
        try {
            console.log('API : getNovelInfoFromMongoDB')
            console.log('params: ' + req.params.novel + ' chapter ' + req.params.chapter)
            // Tìm tiểu thuyết trong MongoDB dựa trên slug
            const novel = await ChapterDetail.findOne({ novel: req.params.novel, chapterNumber: req.params.chapter });
            if (!novel) {
                console.log('Chapter ' + req.params.novel + ' not found')
                // Nếu không tìm thấy tiểu thuyết trong MongoDB, gọi hàm để lấy thông tin từ trang web
                await chapterController.getChapterContent(req, res);
            } else {
                // Nếu tìm thấy, trả về thông tin tiểu thuyết
                res.status(200).json(novel);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error: " + error.name });
        }
    },


    searchByTitle: async (req, res) => {
        try {
            const perPage = 50;
            console.log('API : searchByTitle');
            // Tìm kiếm dựa trên title, không phân biệt hoa thường
            const searchText = req.params.title;

            // Sử dụng text search để tìm kiếm văn bản không cần khớp hoàn toàn
            const novels = await NovelListRecommend.find({ $text: { $search: searchText } })
                .sort({ updatedAt: -1 }) // Sắp xếp theo thời gian cập nhật mới nhất
                .skip((req.params.page - 1) * perPage)
                .limit(perPage);

            if (novels.length === 0) {
                res.status(404).json({
                    status: 404,
                    message: 'Not Found'
                });
            } else {
                console.log('Novel length: ' + novels.length);
                res.status(200).json(novels);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error: " + error.name });
        }
    }



}

module.exports = mongodbController;
