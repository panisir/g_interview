const Record = require('../models/recordsModel');
const moment = require('moment');

exports.getFilteredRecords = function (req, res, next) {
    var recordArr = [];

    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var minCount = req.body.minCount;
    var maxCount = req.body.maxCount;

    checkAndValidateRequestParameters(startDate, endDate, minCount, maxCount, next);

    let promise = Record.find({
        "createdAt": {
            "$gte": new Date(startDate).toISOString(),
            "$lt": new Date(endDate).toISOString()
        }
    }).select("key").select("createdAt").select("counts").select("-_id").exec();

    if (promise instanceof Promise) {
        promise.then(function (doc) {
            modifyArr(doc.filter(filterWithTotalCount));

            /////////////////

            function filterWithTotalCount(record) {
                let totalCount = 0;
                record.counts.forEach(function (counts) {
                    totalCount += counts;
                });
                return totalCount > minCount && totalCount < maxCount;
            }
        }).catch(next);
    }

    function modifyArr(arr) {
        arr.forEach(function (item) {
            let totalCount = 0;
            item.counts.forEach(function (count) {
                totalCount += count;
            });

            recordArr.push({
                key: item.key,
                createdAt: item.createdAt,
                totalCount: totalCount
            });
        });

        return res.format({
            'application/json': function () {
                res.status(200).send({
                    code: 0,
                    msg: 'Success',
                    records: recordArr
                });
            },
        });
    }
};

function checkAndValidateRequestParameters(startDate, endDate, minCount, maxCount, next) {
    var properTimeFormat = "YYYY-MM-DD";

    if (!startDate || !endDate || !minCount || !maxCount) {
        let error = new Error('Empty Query Field');
        error.status = 400;
        return next(error);

    }
    if (!moment(startDate, properTimeFormat, true).isValid() || !moment(endDate, properTimeFormat, true).isValid()) {
        let error = new Error('Invalid time format!');
        error.status = 400;
        console.error("Invalid time format!");
        return next(error);
    }

    if (minCount < 0 || maxCount < 0) {
        let error = new Error('Count value can not be less than zero!');
        error.status = 400;
        console.error("Count value can not be less than zero!");
        return next(error);
    }
}
