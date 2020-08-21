const config = require("./config/env");
const lang = require("./config/lang");
const mongo = require('mongodb').MongoClient;
const TelegramBot = require('node-telegram-bot-api');
const token = config.getConfig('tg_api_key');
const MongoClient = require('mongodb').MongoClient;
const mongo_db_url = config.getConfig('mongo_db');

MongoClient.connect(mongo_db_url, function (err, connection) {
    if (err) throw err;
    var db = connection.db("spending_bot");

    var bot = new TelegramBot(token, {polling: true});

    bot.onText(/\/start/, function (msg, match) {
        newQuestion(msg);
    });

    bot.on('callback_query', function (msg) {
        console.log(msg);
        var answer = msg.data.split('_');
        var index = answer[0];
        var button = answer[1];


//    bot.answerCallbackQuery(msg.id, 'Вы выбрали: '+ msg.data, true);
        newQuestion(msg);
    });

// THE END. MUDA-MUDA-MUDA-MUDAAAAAA

    function getQuestion(msg) {


        let data;
        data = db.collection("blocks").find({}, { address:"/start" }).toArray(function(err, result) {
            if (err) throw err;
        });

        console.log(data);
    }

    function newQuestion(msg) {
        var arr = getQuestion(msg);
        var text = arr.title;
        var options = {
            reply_markup: JSON.stringify({
                inline_keyboard: arr.buttons,
                parse_mode: 'Markdown'
            })
        };
        chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
        bot.sendMessage(chat, text, options);
    }
});