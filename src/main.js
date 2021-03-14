const crawler = require("crawler");
const CSV = require('csv-string');
const db = require('../models');

class TransactionInfoEachDayCrawler {
    startDate = null;
    crawler = null;
    targetList = [];
    constructor(startDate){
        this.startDate = startDate;
        let _this = this;
        this.crawler = new crawler({
            maxConnections : 1,
            rateLimit: 1000,
            callback : function (error, res, done) {
                if(error){
                    console.log(error);
                }else{
                    try {
                        let data = _this.dataHandler(res.body);
                        _this.save(data, res.options.stock_no);
                    } catch (e) {
                        console.warn('Error:', e);
                    }
                }
                done();
            }
        });
    };
    trigger() {
        const now = new Date();
        while(this.startDate <= now) {
            const year = this.startDate.getYear() + 1901;
            const month = this.startDate.getMonth() + 1;
            const day = this.startDate.getDate();
            const date = `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`;
            this.targetList.forEach(company => {
                const url = `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=csv&date=${date}&stockNo=${company}`;
                this.crawler.queue({uri: url, stock_no: company});
                return;
            });
            if (this.startDate.getMonth() == 11) {
                this.startDate.setYear(this.startDate.getYear() + 1);
                this.startDate.setMonth(0);
            } else {
                this.startDate.setMonth(this.startDate.getMonth() + 1);
            }
        }
        
        
    }
    dataHandler(body) {
        const data = CSV.parse(body);
        const validData = data.filter(item => {
            return /^\d{2,3}\/\d{2,2}\/\d{2,2}$/.test(item[0]);
        });
        return validData;
    }
    save (validData, stock_no) {
        validData.forEach( async (item) => {
            const {year, month, day} = {
                year: parseInt(item[0].split('/')[0]) + 1911, 
                month: item[0].split('/')[1], 
                day: item[0].split('/')[2]
            };
            let data = {
                date: new Date(year, month, day,0,0,0,0),
                stock_no: stock_no,
                shares_traded: item[1].split(',').join(''),
                turnover: item[2].split(',').join(''),
                opening_price: item[3],
                max_price: item[4],
                min_price: item[5],
                closing_price: item[6],
                price_difference: item[7],
                transaction_number: item[8].split(',').join('')
            }
            const result = await db.TransactionInfoEachDay.create(data);
        })
    }
}

main();

async function main () {
    const startDate = new Date(2020, 0, 1);
    const result = await db.Company.findAll({attributes: ['stock_no']});
    let targetList = result.map(item=>item.stock_no);

    const transactionInfoEachDayCrawler = new TransactionInfoEachDayCrawler(startDate);
    transactionInfoEachDayCrawler.targetList = targetList;
    
    transactionInfoEachDayCrawler.trigger();
}