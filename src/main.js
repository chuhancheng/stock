const Crawler = require('crawler');
const HTMLParser = require('node-html-parser');
const request = require('request');
const cheerio = require('cheerio');
const fakeUa = require('fake-useragent');

const fs = require('fs');

main();

const ipAddresses = [];
const portNumbers = [];

function getIPList () {
    return new Promise((resolve, reject) => {
        const crawler = new Crawler({
            userAgent: fakeUa(),
            maxConnections: 1,
            rateLimit: 5000,
            jQuery: false, // set false to suppress warning message.
            callback: function (error, res, done) {
                if (error) {
                    console.log('Error loading proxy, please try again');
                    reject(new Error('Error loading proxy, please try again'));
                } else {
                    const $ = cheerio.load(res.body);
                    $('td:nth-child(1)').each(function (index, value) {
                        ipAddresses[index] = $(this).text();
                    });
                    $('td:nth-child(2)').each(function (index, value) {
                        portNumbers[index] = $(this).text();
                    });
                    resolve();
                }
                done();
            }
        });
        const url = 'https://sslproxies.org/';
        crawler.queue({
            uri: url
        });
    });
}

async function fileFetchData () {
    return new Promise((resolve, reject) => {
        fs.readFile('./result2.html', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                reject(new Error('load file failed'));
            }
            resolve(data);
        });
    });
}

async function httpFetchData () {
    return new Promise((resolve, reject) => {
        const randomNumber = Math.floor(Math.random() * 100);
        const proxy = `http://${ipAddresses[randomNumber]}:${portNumbers[randomNumber]}`;
        const url = 'https://course.ncku.edu.tw/index.php?c=qry11215&i=UG9QaVFiVWsAKldwBmoHZVluByENalZyUGwJPgZvATVRNFEyAG5WelRqVzVdPVVyBmYDKgI8BzAGZgQwAmsAfwA3AzoFMlRrV2dRPwFmUzpdK1AnWm4AMQQ5AX0BNgBgUXZWcQ0HUWABagd2D24DdVVsUG4FOlYiVjIFJFRGU25QKVBxUW1VLAA4VzkGYQdmWWQHOA1iVmpQZgltBi4Bd1E8UTUAb1YrVDNXa110VT4GZANlAmIHcwZnBHECawA2AG8DOgUgVLRXulGEAbFTpV39ULJawAC5BOQB8gHEAO1RjlaCDb9RowGTB7MPwAOjVXRQYAV9Vn1WfwU5VDZTbVAsUCFRdFVqADBXOQZiB25ZLwdqDTlWYFBsCT4GbwE0UT1RawBvVjhUa1dtXT1VYQY1AzgCPAcsBi8EOAJgAD4AfANnBSBUa1dkUT8BZlM7XS0=';
        console.log('Fetch with Proxy:', proxy);
        const options = {
            url: url,
            method: 'GET',
            proxy: proxy
        };
        request(options, function (error, response, html) {
            if (!error && response.statusCode === 200) {
                resolve(html);
            } else {
                console.log('Error loading proxy, please try again');
                reject(new Error('Error loading proxy, please try again'));
            }
        });
    });
}

async function checkPosition () {
    let html;
    try {
        html = await httpFetchData();
    } catch (e) {
        console.log('fetch data failed');
        return 0;
    }
    const $ = cheerio.load(html);
    const departmentName = $('#A9-table > tbody > :nth-child(3) > :nth-child(1)').clone().children().remove().end().text(); ;
    const registerCount = $('#A9-table > tbody > :nth-child(3) > :nth-child(8)').clone().children().remove().end().text(); ;
    const courseName = $('#A9-table > tbody > :nth-child(3) > :nth-child(5) > .course_name > a').clone().children().remove().end().text(); ;
    console.log('departmentName:', departmentName);
    console.log('registerCount:', registerCount);
    console.log('courseName:', courseName);
    const position = registerCount.split('/')[1];
    return parseInt(position);
}

async function main () {
    await getIPList();
    console.log('ipAddresses updated');
    while (true) {
        const positionNumber = await checkPosition();
        console.log('positionNumber:', positionNumber);
        if (positionNumber > 0) {
            break;
        }
    }
}

function old () {
    const crawler = new Crawler({
        userAgent: fakeUa(),
        maxConnections: 1,
        rateLimit: 1000,
        retries: 1,
        jQuery: false, // set false to suppress warning message.
        callback: function (error, res, done) {
            if (error) {
                console.log(error);
            } else {
                try {
                    // console.log(res.body);
                    const $ = cheerio.load(res.body);
                    const registerCount = $('#A9-table > tbody > :nth-child(1) > :nth-child(8)');
                    const courseName = $('#A9-table > tbody > :nth-child(1) > :nth-child(5)');
                    console.log('courseName:', courseName.clone().children().remove().end().text());
                    console.log('registerCount:', registerCount.clone().children().remove().end().text());
                } catch (e) {
                    console.warn('Error:', e);
                }
            }
            done();
        }
    });
    const url = 'https://course.ncku.edu.tw/index.php?c=qry11215&i=UG9QaVFiVWsAKldwBmoHZVluByENalZyUGwJPgZvATVRNFEyAG5WelRqVzVdPVVyBmYDKgI8BzAGZgQwAmsAfwA3AzoFMlRrV2dRPwFmUzpdK1AnWm4AMQQ5AX0BNgBgUXZWcQ0HUWABagd2D24DdVVsUG4FOlYiVjIFJFRGU25QKVBxUW1VLAA4VzkGYQdmWWQHOA1iVmpQZgltBi4Bd1E8UTUAb1YrVDNXa110VT4GZANlAmIHcwZnBHECawA2AG8DOgUgVLRXulGEAbFTpV39ULJawAC5BOQB8gHEAO1RjlaCDb9RowGTB7MPwAOjVXRQYAV9Vn1WfwU5VDZTbVAsUCFRdFVqADBXOQZiB25ZLwdqDTlWYFBsCT4GbwE0UT1RawBvVjhUa1dtXT1VYQY1AzgCPAcsBi8EOAJgAD4AfANnBSBUa1dkUT8BZlM7XS0=';

    const randomNumber = Math.floor(Math.random() * 100);
    const proxy = `http://${ipAddresses[randomNumber]}:${portNumbers[randomNumber]}`;
    // const proxy2 = 'http://170.39.194.16:3128';
    console.log('use proxy:', proxy);
    crawler.queue({
        uri: url,
        proxy: proxy
    });
}
