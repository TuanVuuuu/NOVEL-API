const puppeteer = require('puppeteer');
const NovelListRecommend = require('../model/novel_list_recommend');
const NovelDetail = require('../model/novel_detail_model');
const NovelListTop = require('../model/novel_list_top');
const { ChapterDetail } = require('../model/chapter_detail_model');
const { param } = require('../routes/novel');
require('dotenv').config();

const LOCAL_HOST = 'http://localhost:8000'
const BASE_URL_NOVEL_RECOMMEND = 'https://metruyencv.com/truyen?sort_by=new_chap_at&props=1'
const BASE_URL_NOVEL_TOP = 'https://metruyencv.com/bang-xep-hang/tuan/thinh-hanh'
const BASE_URL = 'https://metruyencv.com'

const autoCrawlController = {
    // GET LIST RECOMMEND NOVEL
    crawlNovel: async () => {
        try {
            autoCrawlController.getListTopNovel()
            console.log("API: crawlNovel")
            const url = BASE_URL_NOVEL_RECOMMEND + '/';
            const browser = await puppeteer.launch({
                headless: "new"
            });

            const page = await browser.newPage();
            await page.goto(url);
            await page.waitForSelector('.media-body', { timeout: 320000 });
            await autoScroll(page)
            // Trích xuất thông tin về tiểu thuyết
            const listDataTeam = await page.evaluate(() => {
                const dataList = [];
                const elements = document.querySelectorAll('.col-6');
                elements.forEach(element => {
                    const titleElement = element.querySelector('.media-body');
                    const title = titleElement ? titleElement.querySelector('a').textContent.trim() : '';
                    if (!title) {
                        return;
                    }
                    const hrefElement = element.querySelector('.media.border-bottom.py-4 > a')
                    const href = hrefElement ? '/v1' + hrefElement.getAttribute('href') : ''
                    const imageElement = element.querySelectorAll('a img')
                    const imageList = Array.from(imageElement).map(el => {
                        return el.getAttribute('src')
                    })
                    const image = imageList ? imageList[0] : ''
                    const descriptionElement = element.querySelectorAll('.text-secondary.text-overflow-2-lines.fz-14.mb-3');
                    const description = Array.from(descriptionElement).map(el => {
                        const descriptionLines = el.textContent.trim().split('\n'); // Tách mô tả thành các dòng
                        // Thay thế ký tự \t bằng 5 dấu cách
                        const cleanedLines = descriptionLines.map(line => line.replace(/\t/g, '     '));
                        return cleanedLines;
                    }).flat();
                    const authorElement = element.querySelector('.truncate-140');
                    const author = authorElement ? authorElement.textContent.trim() : '';

                    const chaptersElement = element.querySelectorAll('.d-flex.align-items-center.fz-13.mr-4')[1];
                    const chapters = chaptersElement ? chaptersElement.textContent.trim() : '';
                    const genreElement = element.querySelectorAll('.d-flex.align-items-start > span')
                    genreList = Array.from(genreElement).map(el => {
                        return el.textContent.trim()
                    })
                    const genre = genreList ? genreList[0] : ''
                    const storyData = {
                        title,
                        image,
                        description,
                        author,
                        chapters,
                        genre,
                        href,
                        updatedAt: new Date()
                    };
                    dataList.push(storyData);
                });
                return dataList;
            });

            await browser.close();

            // Kiểm tra và thêm dữ liệu vào MongoDB
            for (const novel of listDataTeam) {
                const existingNovel = await NovelListRecommend.findOne({ href: novel.href });
                if (!existingNovel) {
                    novel.updatedAt = new Date();
                    await NovelListRecommend.create(novel);
                    console.log('Create ' + novel.title + ' Create at: ' + novel.updatedAt)
                    await browser.close();
                } else if (existingNovel.chapters !== novel.chapters) {
                    novel.updatedAt = new Date();
                    await NovelListRecommend.updateOne({ href: novel.href }, { $set: { chapters: novel.chapters } });
                    console.log('Update ' + novel.title + ' Update at: ' + novel.updatedAt)
                }
                await autoCrawlController.getNovelInfo(novel);
            }

            autoCrawlController.crawlNovel()


        } catch (error) {
            console.error(error);
            autoCrawlController.crawlNovel()
        }
    },


    // GET LIST TOP NOVEL
    getListTopNovel: async () => {
        try {
            console.log("API: getListTopNovel")
            const url = BASE_URL_NOVEL_TOP + '/';
            const browser = await puppeteer.launch({
                headless: "new"
            });
            const page = await browser.newPage();
            await page.goto(url);
            await page.waitForSelector('.list-unstyled', { timeout: 320000 });
            await autoScroll(page)
            const listDataTeam = await page.evaluate(() => {
                const dataList = [];
                const elements = document.querySelectorAll('.media.py-4.border-bottom');
                elements.forEach((element, index) => {

                    const titleElement = element.querySelector('.media-body');
                    const title = titleElement ? titleElement.querySelector('a').textContent.trim() : '';
                    // Bỏ qua vòng lặp hiện tại nếu tiêu đề là null
                    if (!title) {
                        return; // Sẽ bỏ qua vòng lặp hiện tại và thực thi vòng lặp tiếp theo
                    }
                    const hrefElement = element.querySelector('.media.border-bottom.py-4 > a')
                    const href = hrefElement ? '/v1' + hrefElement.getAttribute('href') : ''

                    const imageElement = element.querySelectorAll('a img')
                    const imageList = Array.from(imageElement).map(el => {
                        return el.getAttribute('src')
                    })
                    const image = imageList ? imageList[0] : ''
                    const descriptionElement = element.querySelectorAll('.text-secondary.fz-14.text-overflow-3-lines');
                    const description = Array.from(descriptionElement).map(el => {
                        const descriptionLines = el.textContent.trim().split('\n'); // Tách mô tả thành các dòng
                        // Thay thế ký tự \t bằng 5 dấu cách
                        const cleanedLines = descriptionLines.map(line => line.replace(/\t/g, '     '));
                        return cleanedLines;
                    }).flat();
                    const authorElement = element.querySelector('.d-flex.align-items-center.mr-4');
                    const author = authorElement ? authorElement.textContent.trim() : '';
                    const genreNextElement = authorElement.nextElementSibling.nextElementSibling
                    const genreElement = genreNextElement.querySelector('span')
                    const genre = genreElement ? genreElement.textContent.trim() : '';
                    const storyData = {
                        title,
                        image,
                        description,
                        author,
                        genre,
                        href,
                        updatedAt: new Date(),
                        rank: index + 1
                    };
                    dataList.push(storyData);
                });
                return dataList;
            });
            await browser.close();
            // Sắp xếp toàn bộ novel trong MongoDB theo rank từ thấp đến cao
            const allNovels = await NovelListTop.find().sort({ rank: 1 });
            // Cập nhật lại rank cho tất cả các novel
            for (let i = 0; i < allNovels.length; i++) {
                const novelDb = allNovels[i];
                novelDb.rank += 10;
                await novelDb.save();
            }
            // Tiếp tục với mã để kiểm tra và thêm mới hoặc cập nhật novel
            for (const novel of listDataTeam) {
                const existingNovel = await NovelListTop.findOne({ href: novel.href });
                if (!existingNovel) {
                    novel.updatedAt = new Date();
                    await NovelListTop.create(novel);
                    console.log('Create ' + novel.title + ' Create at: ' + novel.updatedAt)
                } else if (existingNovel.rank !== novel.rank) {
                    novel.updatedAt = new Date();
                    await NovelListTop.updateOne({ href: novel.href }, { $set: { rank: novel.rank } });
                    console.log('Update ' + novel.title + ' Update at: ' + novel.updatedAt + 'to rank:' + novel.rank)
                }
            }
        } catch (error) {
            console.error(error);
        }
    },


    // GET NOVEL INFO
    getNovelInfo: async (novel) => {
        try {
            console.log('API: getNovelInfo')
            const browser = await puppeteer.launch({ headless: "new" });
            const page = await browser.newPage();
            await page.goto(BASE_URL + '/truyen/' + novel.href.replace('/v1/truyen/', '') + '/');
            const title = (await page.title()).replace(' Convert', '');
            const chapterTab = await page.$('#nav-tab-chap');
            if (chapterTab) await chapterTab.click();
            await page.waitForSelector('.col-4.border-bottom-dashed');
            const novelInfo = await page.evaluate((title, localhost, baseUrl, novel) => {
                let description = '';
                let chapterLatest = [];
                const dataList = [];
                const authorElement = document.querySelector('.list-unstyled.mb-4 li:first-child a');
                const statusElement = document.querySelector('.list-unstyled.mb-4 li:nth-child(2)');
                const genreElements = document.querySelectorAll('.list-unstyled.mb-4 li:nth-child(n+3) a');
                const chaptersElement = document.querySelector('.list-unstyled.d-flex.mb-4 li:nth-child(1) div');
                const chaptersPerWeekElement = document.querySelector('.list-unstyled.d-flex.mb-4 li:nth-child(2) div');
                const viewsElement = document.querySelector('.list-unstyled.d-flex.mb-4 li:nth-child(3) div');
                const bookmarkedElement = document.querySelector('.list-unstyled.d-flex.mb-4 li:nth-child(4) div');
                const ratingValueElement = document.querySelector('.d-flex.align-items-center.mb-4 .font-weight-semibold');
                const ratingTextElement = document.querySelector('.d-flex.align-items-center.mb-4 .d-inline-block.text-secondary');
                if (!authorElement || !statusElement || genreElements.length === 0) {
                    throw new Error("Không thể tìm thấy thông tin truyện.");
                }
                const author = authorElement.textContent.trim();
                const status = statusElement.textContent.trim();
                const genres = Array.from(genreElements).map(element => element.textContent.trim());
                const chapters = chaptersElement ? chaptersElement.textContent.trim() : '';
                const chaptersPerWeek = chaptersPerWeekElement ? chaptersPerWeekElement.textContent.trim() : '';
                const views = viewsElement ? viewsElement.textContent.trim() : '';
                const bookmarked = bookmarkedElement ? bookmarkedElement.textContent.trim() : '';
                const rating = ratingValueElement ? ratingValueElement.textContent.trim() : '';
                const ratingCount = ratingTextElement ? ratingTextElement.textContent.trim().replace(/\D/g, '') : '';
                // Lấy thông tin mô tả
                const descriptionElement = document.querySelector('.content');
                if (descriptionElement) {
                    const descriptionText = descriptionElement.innerHTML.trim();
                    const descriptionWithoutPTag = descriptionText.replace(/<\/?p>/g, ''); // Xoá tất cả thẻ <p> và </p>
                    description = descriptionWithoutPTag.split('<br>');
                }
                // Lấy thông tin chương mới nhất
                const chapterElement = document.querySelector('.list-unstyled.m-0 li.media');
                if (chapterElement) {
                    const linkElement = chapterElement.querySelector('a');
                    const timeElement = chapterElement.querySelector('div.pl-3');

                    if (linkElement) {
                        const chapterTitle = linkElement.textContent.trim();
                        const chapterLink = localhost + linkElement.getAttribute('href').replace(baseUrl + '/truyen', '/v1');
                        const chapterTime = timeElement ? timeElement.textContent.trim() : '';

                        chapterLatest.push({
                            chapterTitle,
                            chapterLink,
                            chapterTime
                        });
                    }
                }
                // Lấy danh sách chương
                const chapterListElement = document.getElementById('chapter-list');
                const chapterList = [];
                if (chapterListElement) {
                    const chapterItems = chapterListElement.querySelectorAll('.col-4.border-bottom-dashed');
                    chapterItems.forEach((item, index) => {
                        const linkElement = item.querySelector('a');
                        const titleElement = item.querySelector('.text-overflow-1-lines');
                        const timeElement = item.querySelector('small.text-muted');

                        if (linkElement && titleElement) {
                            const chapterTitle = titleElement.textContent.trim();
                            const chapterLink = localhost + '/v1/' + linkElement.getAttribute('href');
                            const chapterTime = timeElement ? timeElement.textContent.trim() : '';

                            chapterList.push({
                                index: index,
                                chapterTitle,
                                chapterLink,
                                chapterTime
                            });
                        }
                    });
                }
                const storyData = {
                    title,
                    author,
                    status,
                    genres,
                    chapters,
                    chaptersPerWeek,
                    views,
                    bookmarked,
                    rating,
                    ratingCount,
                    description,
                    chapterLatest,
                    chapterList,
                    href: novel.href.replace('/v1/truyen/', ''),
                };
                dataList.push(storyData);
                return dataList;
            }, title, LOCAL_HOST, BASE_URL, novel);
            await browser.close();
            //MONGO DATABASE
            // Kiểm tra tiểu thuyết đã tồn tại trong cơ sở dữ liệu hay chưa
            const existingNovel = await NovelDetail.findOne({ href: novelInfo[0].href });
            if (existingNovel) {
                // Nếu tiểu thuyết đã tồn tại, cập nhật lại dữ liệu
                await NovelDetail.findOneAndUpdate({ href: novelInfo[0].href }, novelInfo[0]);
                console.log('Novel detail updated successfully.');
                const chapterList = novelInfo[0].chapterList;
                for (let i = chapterList.length - 1; i >= 0; i--) {
                    const chapter = chapterList[i];
                    try {
                        console.log('Chapter Number: ' + chapter.index);
                        await autoCrawlController.getChapterContent(chapter, novel.href.replace('/v1/truyen/', ''));
                    } catch (error) {
                        console.error(error);
                        // Xử lý lỗi nếu cần thiết
                    }
                }


            } else {
                // Nếu tiểu thuyết chưa tồn tại, thêm mới dữ liệu
                const newNovelDetail = new NovelDetail(novelInfo[0]);
                await newNovelDetail.save();
                console.log('Novel detail added successfully.');
                const chapterList = novelInfo[0].chapterList;
                for (let i = chapterList.length - 1; i >= 0; i--) {
                    const chapter = chapterList[i];
                    try {
                        console.log('Chapter Number: ' + chapter.index);
                        await autoCrawlController.getChapterContent(chapter, novel.href.replace('/v1/truyen/', ''));
                    } catch (error) {
                        console.error(error);
                        // Xử lý lỗi nếu cần thiết
                    }
                }

            }
        } catch (error) {
            console.error(error);
            autoCrawlController.crawlNovel()
        }
    },

    //GET CHAPTER CONTENT
    getChapterContent: async (chapter, name) => {
        try {
            console.log('API: getChapterContent')
            const browser = await puppeteer.launch({ headless: "new" }); // Mở trình duyệt ở chế độ ẩn
            const page = await browser.newPage();
            await page.goto(BASE_URL + '/truyen/' + name + '/chuong-' + (chapter.index + 1));
            console.log('URL ' + BASE_URL + '/truyen/' + name + '/chuong-' + (chapter.index + 1))

            await page.waitForSelector('#article', { timeout: 320000 });
            const novelInfo = await page.evaluate((name, chapter) => {
                const chapterTextElement = document.querySelector('#article');
                let chapterTextLines = [];

                if (chapterTextElement) {
                    const chapterText = chapterTextElement.innerHTML.trim();
                    const div = document.createElement('div');
                    div.innerHTML = chapterText;
                    // Chia các dòng bởi thẻ <br>
                    chapterTextLines = chapterText.split('<br>');
                    // Loại bỏ các phần tử có chứa đoạn văn bản <div>
                    chapterTextLines = chapterTextLines.filter(line => !line.includes('<div'));
                }

                const chapterTitleDocument = document.querySelector('.h1.mb-4.font-weight-normal.nh-read__title')
                const chapterTitle = chapterTitleDocument ? chapterTitleDocument.textContent.trim() : ''
                return {
                    chapterTitle: chapterTitle,
                    chapterText: chapterTextLines,
                    novel: name,
                    chapterNumber: chapter.index
                };
            }, name, chapter);
            await browser.close();

            // Kiểm tra xem đã có chương này trong MongoDB chưa
            const existingChapter = await ChapterDetail.findOne({ novel: novelInfo.novel, chapterNumber: novelInfo.chapterNumber });

            if (existingChapter) {
                // Nếu đã tồn tại, trả về nội dung của chương đã tồn tại
                console.log("Chapter already exists in MongoDB:", novelInfo.chapterTitle);
                return res.status(200).json(existingChapter);
            } else {
                // Nếu chưa tồn tại, thêm mới vào MongoDB
                const newChapterDetail = new ChapterDetail(novelInfo);
                await newChapterDetail.save();
                console.log("Data added to MongoDB:", novelInfo.chapterTitle);
            }
        } catch (error) {
            console.error(error);
        }
    }
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

module.exports = autoCrawlController;
