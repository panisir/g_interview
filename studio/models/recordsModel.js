const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recordSchema = new Schema({
    key: {type: String, require: true, max: 100},
    value: {type: String, required: true},
    createdAt: {type: Date, required: true},
    counts: {type: Array, required: true},
});

module.exports = mongoose.model('Record', recordSchema);
