const config = require("./config/env");
const lang = require("./config/lang");
const TelegramBot = require('node-telegram-bot-api');
const token = config.getConfig('tg_api_key');
const MongoClient = require('mongodb').MongoClient;
const mongo_db_url = config.getConfig('mongo_db');

MongoClient.connect(mongo_db_url, function (err, connection) {
    if (err) throw err;
    let db = connection.db("spending_bot");

    let bot = new TelegramBot(token, {polling: true});

    bot.onText(/\/start/, function (msg, match) {
        getQuestion(msg);
    });

    bot.on('callback_query', function (msg) {
        getQuestion(msg);
//    bot.answerCallbackQuery(msg.id, 'Вы выбрали: '+ msg.data, true);
    });

// THE END. MUDA-MUDA-MUDA-MUDAAAAAA

    function getQuestion(msg) {
        let search_value;
        if (typeof msg.data === "undefined") {
             search_value = msg.text;
        } else {
             search_value = msg.data;
        }

        db.collection("blocks").find({address: search_value}).each(function (err, doc) {
            if (doc !== null) {

                if (typeof doc['type'] !== "undefined") {

                }

                let text = doc['title'];
                let options = {
                    reply_markup: JSON.stringify({
                        inline_keyboard: doc['buttons'],
                        parse_mode: 'Markdown'
                    })
                };

                chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
                bot.sendMessage(chat, text, options);
            }
        });
    }
});