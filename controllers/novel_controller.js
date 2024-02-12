const puppeteer = require('puppeteer');

const SERVER_URL = 'https://novel-api-mo19.onrender.com';
const BASE_URL = 'https://truyenfull.vn';

const novelController = {
    // GET LIST NEW NOVEL
    getListNewNovel: async (req, res) => {
        try {
            const url = BASE_URL + '/danh-sach/truyen-moi/';
            const browser = await puppeteer.launch({
                headless: true,
            });
            const page = await browser.newPage();
            await page.goto(url);

            await autoScroll(page); // Cuộn trang xuống để tải thêm nội dung

            const listDataTeam = await page.evaluate((baseUrl, serverUrl) => {
                const dataList = [];
                const elements = document.querySelectorAll('.list-truyen .row');

                elements.forEach(element => {
                    const titleElement = element.querySelector('.truyen-title > a');

                    const titleItem = titleElement ? titleElement.textContent.trim() : '';
                    const imgElement = element.querySelector('.col-xs-3 img');
                    const src = imgElement ? imgElement.getAttribute('src') : '';
                    const authorElement = element.querySelector('.author');
                    const author = authorElement ? authorElement.textContent.trim() : '';
                    const chapterElement = element.querySelector('.col-xs-2.text-info a');
                    const chapterText = chapterElement ? chapterElement.textContent.trim() : '';
                    const labelElements = element.querySelectorAll('.label-title');
                    const labelList = Array.from(labelElements).map(label => {
                        return label.classList[1].replace('label-', ''); // Lấy class thứ hai của mỗi phần tử, đó chính là giá trị như 'new', 'hot'
                    });

                    const titleHref = titleElement ? titleElement.getAttribute('href') : '';

                    if (titleItem != null && titleItem != '') {
                        dataList.push({
                            nameNovel: titleItem,
                            imageUrl: src,
                            author: author,
                            chapterText: chapterText,
                            labelList: labelList,
                            href: serverUrl + '/v1' + titleHref.split(baseUrl)[1]
                        });
                    }
                });

                return dataList;
            }, BASE_URL, SERVER_URL);

            await browser.close();
            res.status(200).json(listDataTeam);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error:" + error.name });
        }
    },

    // GET NOVEL CHAPTERS
    getNovelChapters: async (req, res) => {
        try {
            const browser = await puppeteer.launch({ headless: true }); // Mở trình duyệt ở chế độ ẩn
            const page = await browser.newPage();
            await page.goto(BASE_URL + '/' + req.params.novel + '/trang-' + req.params.page + '/#list-chapter');
            const novelInfo = await page.evaluate((baseUrl, serverUrl) => {
                const chapters = Array.from(document.querySelectorAll('.list-chapter li')).map(li => {
                    const linkElement = li.querySelector('a');
                    const chapterUrl = linkElement.getAttribute('href');
                    return {
                        title: linkElement.textContent.trim(),
                        url: serverUrl + '/v1' + chapterUrl.split(baseUrl)[1]
                    };
                });
                return {
                    chapters: chapters
                };
            }, BASE_URL, SERVER_URL);

            await browser.close();
            res.status(200).json(novelInfo);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.name });
        }
    },
    // GET NOVEL DETAIL
    getNovelDetail: async (req, res) => {
        try {
            const browser = await puppeteer.launch({ headless: true }); // Mở trình duyệt ở chế độ ẩn
            const page = await browser.newPage();
            await page.goto(BASE_URL + '/' + req.params.novel + '/');

            const novelInfo = await page.evaluate((baseUrl, serverUrl) => {
                const infoElement = document.querySelector('.info');
                const authorElementText = Array.from(infoElement.querySelectorAll('h3')).find(el => el.textContent.trim() === 'Tác giả:');
                const authorElement = authorElementText ? authorElementText.nextElementSibling : null
                const sourceElementText = Array.from(infoElement.querySelectorAll('h3')).find(el => el.textContent.trim() === 'Nguồn:');
                const sourceElement = sourceElementText ? sourceElementText.nextElementSibling : null
                const statusElement = Array.from(infoElement.querySelectorAll('h3')).find(el => el.textContent.trim() === 'Trạng thái:').nextElementSibling;

                const author = authorElement ? authorElement.textContent.trim() : '';
                const source = sourceElement ? sourceElement.textContent.trim() : '';
                const status = statusElement ? statusElement.textContent.trim() : '';

                const genres = Array.from(infoElement.querySelectorAll('a[itemprop="genre"]')).map(genre => genre.getAttribute('title'));
                const name = Array.from(document.querySelectorAll('h3[itemprop="name"]')).map(element => element.textContent.trim())[0];
                const ratingValue = Array.from(document.querySelectorAll('span[itemprop = "ratingValue"]')).map(element => element.textContent.trim())[0]

                const descriptionElement = document.querySelector('.desc-text[itemprop="description"]');
                if (descriptionElement) {
                    const descriptionText = descriptionElement.innerHTML.trim();
                    description = descriptionText.split('<br>');
                }

                const chapters = Array.from(document.querySelectorAll('.l-chapter .l-chapters li')).map(li => {
                    const linkElement = li.querySelector('a');
                    const chapterNumber = linkElement.textContent.trim().match(/\d+/)[0];
                    const chapterTitle = linkElement.getAttribute('title');
                    const chapterUrl = linkElement.getAttribute('href');

                    return {
                        number: chapterNumber,
                        title: chapterTitle,
                        url: serverUrl + '/v1' + chapterUrl.split(baseUrl)[1]
                    };
                });

                return {

                    name: name,
                    author: author,
                    genres: genres,
                    source: source,
                    status: status,
                    ratingValue: ratingValue,
                    description: description,
                    chapters: chapters
                };
            }, BASE_URL, SERVER_URL);

            await browser.close();

            res.status(200).json(novelInfo);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error: " + error.name });
        }
    },
    getChapterContent: async (req, res) => {
        try {
            const browser = await puppeteer.launch({ headless: true }); // Mở trình duyệt ở chế độ ẩn
            const page = await browser.newPage();
            await page.goto(BASE_URL + '/' + req.params.novel + '/chuong-' + req.params.chapter);
            const novelInfo = await page.evaluate(() => {
                const chapterTextElement = document.querySelector('#chapter-c');
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
                return {
                    chapterText: chapterTextLines
                };
            });
            await browser.close();
            res.status(200).json(novelInfo);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
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

module.exports = novelController;
