const puppeteer = require('puppeteer');

const novelController = {
    // ADD AUTHOR
    getNovelChapters: async (req, res) => {
        try {
            const browser = await puppeteer.launch({ headless: true }); // Mở trình duyệt ở chế độ ẩn
            const page = await browser.newPage();
            await page.goto(process.env.BASE_URL + '/' + req.params.novel + '/trang-' + req.params.page + '/#list-chapter');
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
            }, process.env.BASE_URL, process.env.SERVER_URL);

            await browser.close();
            res.status(200).json(novelInfo);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.name });
        }
    }
}

module.exports = novelController;