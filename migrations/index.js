const config = require("../config/env");
const blocks = require("../migrations/blocks").getBlocks();
const MongoClient = require('mongodb').MongoClient;
const mongo_db_url = config.getConfig('mongo_db');


MongoClient.connect(mongo_db_url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("spending_bot");

    dbo.collection("blocks").insert(blocks, function (err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        db.close();
    });

});
