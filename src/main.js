const Crawler = require('crawler');
const CSV = require('csv-string');
const db = require('../models');

class TransactionInfoEachDayCrawler {
    constructor (startDate) {
        this.startDate = startDate;
        this.crawler = null;
        this.targetList = [];
        const _this = this;
        this.crawler = new Crawler({
            maxConnections: 1,
            rateLimit: 5000,
            jQuery: false, // set false to suppress warning message.
            callback: function (error, res, done) {
                if (error) {
                    console.log(error);
                } else {
                    try {
                        const data = _this.dataHandler(res.body);
                        _this.save(data, res.options.stock_no);
                        console.log('Save Complete:', res.options.uri);
                    } catch (e) {
                        console.warn('Error:', e);
                    }
                }
                done();
            }
        });
    }

    async dataExist (date, stockNo) {
        const result = await db.TransactionInfoEachDay.findAll({
            where: {
                date: date,
                stock_no: stockNo
            }
        });
        return result.length > 0;
    }

    trigger () {
        const now = new Date();
        while (this.startDate <= now) {
            const year = this.startDate.getFullYear();
            const month = this.startDate.getMonth() + 1;
            const day = this.startDate.getDate();
            const date = `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`;
            this.targetList.forEach((company) => {
                const url = `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=csv&date=${date}&stockNo=${company}`;
                console.log('queue url:', url);
                this.crawler.queue({
                    uri: url,
                    stock_no: company
                });
            });
            if (this.startDate.getMonth() === 11) {
                this.startDate.setYear(this.startDate.getFullYear() + 1);
                this.startDate.setMonth(0);
            } else {
                this.startDate.setMonth(this.startDate.getMonth() + 1);
            }
        }
    }

    dataHandler (body) {
        const data = CSV.parse(body);
        const validData = data.filter((item) => {
            return /^\d{2,3}\/\d{2,2}\/\d{2,2}$/.test(item[0]);
        });
        return validData;
    }

    save (validData, stockNo) {
        validData.forEach(async (item) => {
            const {
                year,
                month,
                day
            } = {
                year: parseInt(item[0].split('/')[0]) + 1911,
                month: parseInt(item[0].split('/')[1]) - 1,
                day: item[0].split('/')[2]
            };
            const data = {
                date: new Date(Date.UTC(year, month, day)),
                stock_no: stockNo,
                shares_traded: item[1].split(',').join(''),
                turnover: item[2].split(',').join(''),
                opening_price: item[3],
                max_price: item[4],
                min_price: item[5],
                closing_price: item[6],
                price_difference: item[7],
                transaction_number: item[8].split(',').join('')
            };
            await db.TransactionInfoEachDay.create(data);
        });
    }
}

main();

async function main () {
    // const startDate = new Date(2020, 1, 1);
    const startDate = new Date(2021, 2, 1); // 2021/3/1
    const result = await db.Company.findAll({
        attributes: ['stock_no']
    });
    const targetList = result.map((item) => item.stock_no);
    const transactionInfoEachDayCrawler = new TransactionInfoEachDayCrawler(
        startDate
    );
    transactionInfoEachDayCrawler.targetList = targetList;

    transactionInfoEachDayCrawler.trigger();
}
