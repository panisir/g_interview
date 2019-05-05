var express = require('express');
var router = express.Router();
var records_controller = require('../controllers/recordsController');

router.post('/getAllRecords', function (req, res, next) {
    records_controller.getFilteredRecords(req, res, next);
});

module.exports = router;