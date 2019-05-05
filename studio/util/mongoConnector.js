const mongoose = require('mongoose');

/**
 * Provides mongo connection
 * seperated and exported to be managed easier
 */
exports.connectMongoServer = function () {
    mongoose.connect('mongodb://dbUser:dbPassword1@ds249623.mlab.com:49623/getir-case-study', {useNewUrlParser: true});
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        console.log("Connected Successfully to MongoDB Server");
    });
};