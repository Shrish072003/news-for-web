const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for all routes
app.use(cors());

app.get('/latest-news', async (req, res) => {
    try {
        // Fetch the HTML from the news page
        const { data } = await axios.get('https://motoroctane.com/web-stories', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
            },
        });

        // Load the HTML into cheerio
        const $ = cheerio.load(data);

        // Initialize an array to hold the news data
        const news = [];

        // Find each news item and extract the necessary details
        $('.webstoriessection').each((index, element) => {
            const title = $(element).find('.title a').text().trim();
            const url = $(element).find('.title a').attr('href');
            const thumbnail = $(element).find('.thumbnail img').attr('data-lazy-src');
            const authorDate = $(element).find('.post_author_date').text().trim();

            // Check if `url` and `thumbnail` exist and construct absolute URLs
            const absoluteUrl = url && url.startsWith('http') ? url : url ? `https://motoroctane.com${url}` : null;
            const absoluteThumbnail = thumbnail && thumbnail.startsWith('http') ? thumbnail : thumbnail ? `https://motoroctane.com${thumbnail}` : null;

            // Push the extracted data to the news array if all elements are valid
            if (title && absoluteUrl && absoluteThumbnail && authorDate) {
                news.push({
                    title,
                    url: absoluteUrl,
                    thumbnail: absoluteThumbnail,
                    authorDate,
                });
            }
        });

        // Send the news data as JSON response
        res.json(news);
    } catch (error) {
        console.error('Error fetching news:', error.message);
        res.status(500).send('An error occurred while fetching the news');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
