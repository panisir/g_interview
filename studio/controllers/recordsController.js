const Record = require('../models/recordsModel');
const moment = require('moment');

/**
 * Takes
 * @param req,
 * @param res,
 * @param next,
 * and branches needed functions
 */
exports.getFilteredRecords = function (req, res, next) {
    var parameters = {
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        minCount: req.body.minCount,
        maxCount: req.body.maxCount
    };

    checkAndValidateRequestParameters(parameters, next);

    let promise = createQueryAndReturnPromise(parameters);

    if (promise instanceof Promise) {
        filterAndModifyArr(promise, parameters, next, res);
    }
};


/**
 * Takes
 * @param promise to resolve db query
 * Uses
 * @param parameters to filter document array with items'
 * totalCount
 * @param next returns if error occurs
 * @param res used to return res form of arr
 */
function filterAndModifyArr(promise, parameters, next, res) {

    promise.then(function (doc) {

        modifyArrAndReturnResponse(doc.filter(filterWithTotalCount), res);

        /////////////////

        function filterWithTotalCount(record) {
            let totalCount = 0;
            record.counts.forEach(function (counts) {
                totalCount += counts;
            });
            return totalCount > parameters.minCount && totalCount < parameters.maxCount;
        }
    }).catch(next);
}

/**
 * takes filtered document arr
 * @param arr,
 * converts to desired form
 * and prepares res
 * @param res
 */
function modifyArrAndReturnResponse(arr, res) {
    let recordArr = [];
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

/**
 * Takes
 * @param parameters
 * filter query with date range
 * and returns promise
 */
function createQueryAndReturnPromise(parameters) {
    return Record.find({
        "createdAt": {
            "$gte": new Date(parameters.startDate).toISOString(),
            "$lt": new Date(parameters.endDate).toISOString()
        }
    }).select("key").select("createdAt").select("counts").select("-_id").exec();
}

/**
 * Takes
 * @param parameters
 * parameters and checks if query parameter valid
 * before executing db query
 * Uses
 * @param next
 * to return error message with status
 */
function checkAndValidateRequestParameters(parameters, next) {
    var properTimeFormat = "YYYY-MM-DD";

    if (!parameters.startDate || !parameters.endDate || !parameters.minCount || !parameters.maxCount) {
        let error = new Error('Empty Query Field');
        error.status = 400;
        return next(error);
    }

    if (!moment(parameters.startDate, properTimeFormat, true).isValid() || !moment(parameters.endDate, properTimeFormat, true).isValid()) {
        let error = new Error('Invalid time format!');
        error.status = 400;
        console.error("Invalid time format!");
        return next(error);
    }

    if (parameters.minCount < 0 || parameters.maxCount < 0) {
        let error = new Error('Count value can not be less than zero!');
        error.status = 400;
        console.error("Count value can not be less than zero!");
        return next(error);
    }
}
