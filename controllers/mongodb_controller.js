const puppeteer = require('puppeteer');
const router = require("express").Router()
const novelController = require("./novel_controller");
const NovelListRecommend = require('../model/novel_list_recommend');
const NovelDetail = require('../model/novel_detail_model');
require('dotenv').config();

const LOCAL_HOST = 'http://localhost:8000'
const BASE_URL_NOVEL_RECOMMEND = 'https://metruyencv.com/truyen?sort_by=new_chap_at&props=1'
const BASE_URL = 'https://metruyencv.com'

const mongodbController = {
    // GET LIST RECOMMEND NOVEL FROM MONGODB
    getNovelListRecommentFromMongoDB: async (req, res) => {
        try {
            const perPage = 20;
            console.log('API : getNovelListRecommentFromMongoDB')
            const novels = await NovelListRecommend.find({})
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
                await novelController.getNovelInfo(req, res);
            } else {
                res.status(200).json([novel]);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error: " + error.name });
        }
    }

}

module.exports = mongodbController;
