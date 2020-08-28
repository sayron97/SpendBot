const config = require("./config/env");
const lang = require("./config/lang");
const TelegramBot = require('node-telegram-bot-api');
const token = config.getConfig('tg_api_key');
const MongoClient = require('mongodb').MongoClient;
const mongo_db_url = config.getConfig('mongo_db');
const new_product_button = require("./migrations/blocks").newProductButton();




MongoClient.connect(mongo_db_url, function (err, connection) {
    if (err) throw err;
    let db = connection.db("spending_bot");

    let bot = new TelegramBot(token, {polling: true});

    bot.onText(/\/start/, function (msg, match) {
        getQuestion(msg);
    });

    bot.onText(/\/add_product (.+)/, (msg, match) => {
        db.collection('products').update({text:match[1]}, {text:match[1], callback_data:match[1]},  { upsert: true }, function (err, res) {
            if (err) throw err;

            let response = 'Добавлено!';
            if(res.result.nModified){
                response = 'Обновлено!';
            }
            bot.sendMessage(msg.chat.id, response);
        });
    });

    bot.on('callback_query', function (msg) {
        getQuestion(msg);
//    bot.answerCallbackQuery(msg.id, 'Вы выбрали: '+ msg.data, true);
    });

// THE WORLD!!!. MUDA-MUDA-MUDA-MUDAAAAAA




    function getQuestion(msg) {
        let search_value;
        if (typeof msg.data === "undefined") {
             search_value = msg.text;
        } else {
             search_value = msg.data;
        }

        db.collection("blocks").find({address: search_value}).each(function (err, doc) {
            if (doc !== null) {
                getOptions(doc, msg);
            }
        });
    }

    function getOptions(doc, msg)
    {
        let text = doc['title'];
        let chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;

        switch (doc['type']) {
            case 'enter_text':
                bot.sendMessage(chat, text, getEnterTextOption())
                    .then(function(sended) {
                        /*switch (sended['text']) {
                            case ''
                        }*/
                        bot.onReplyToMessage(chat, sended.message_id, function (message) {
                            sendProductList(message.text, msg)
                        });
                    })
                break;
            case 'choose':
                break;
            default:  //buttons type
                switch (doc.address) {
                    case 'enter_first_letter':
                        db.collection("products").find({}).toArray(function (err, res) {
                            bot.sendMessage(chat, text, getButtonOptions([res]));
                        });
                        break;
                    default:
                        bot.sendMessage(chat, text, getButtonOptions(doc['buttons']));
                }
          //      bot.sendMessage(chat, text, getButtonOptions(doc['buttons']));
        }
    }

    function getButtonOptions(buttons)
    {
        return {
            reply_markup: JSON.stringify({
                inline_keyboard: buttons,
                parse_mode: 'Markdown'
            })
        };
    }

    function getEnterTextOption()
    {
        return {
            reply_markup: JSON.stringify({ force_reply: true }
            )};
    }

    function getChooseOption()
    {

    }

    function sendProductList(product_str, msg)
    {
        db.collection("product_list").find({name: "/"+product_str+"/"}).each(function (err, doc) {
            let new_doc = [];
            if (doc == null) {
                new_doc['title'] = 'Выбор продукта';
                new_doc['type'] = 'button';
                new_doc['buttons'] = new_product_button
            }

            getOptions(new_doc, msg);
        });
    }
});