'use strict';

var mongoClient = require('mongodb').MongoClient;

exports.createMongoConnection = function(url, options, callback) {
    console.log("url is ---->>>>", url);
    mongoClient.connect(url, options, function(err, dbConn) {
        console.log("inside connect:");
        if (err) {
            console.log("inside mongo connect err---->>>>:"+JSON.stringify(err));
            err = JSON.stringify(err);
            if(err.name && err.name.toUpperCase() === "MONGONETWORKERROR"){
               return callback(err.message);
            }
              return callback(err);
        }             
        console.log("connection established:");
        callback(null, {'db' : dbConn});
    });
}