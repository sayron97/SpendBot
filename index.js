const config = require("./config/env");
const lang = require("./config/lang");
const TelegramBot = require('node-telegram-bot-api');
const token = config.getConfig('tg_api_key');
const MongoClient = require('mongodb').MongoClient;
const mongo_db_url = config.getConfig('mongo_db');
const new_product_button = require("./migrations/blocks").newProductButton();
const block_after_new_spend = require("./migrations/blocks").blockAfterNewSpend();

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

        switch(search_value) {
            case 'add_more':
                search_value = 'enter_first_letter'
                break;
            case 'spends':
                search_value = 'spends'
                break;
            case 'back' :
                search_value = 'spends'
                break;
            default:
        }

        if (typeof msg.message !== "undefined") {
            switch (msg.message.text) {
                case 'Период времени':
                    sentStatistic(msg.data, msg.from.id);
                    break;
                case 'Выберите продукт':
                    addNewProduct(msg);
                    break;
                default:
            }
        }

        db.collection("blocks").find({address: search_value}).each(function (err, doc) {
            if (doc !== null) {
                getOptions(doc, msg);
            }
        });
    }

    function sentStatistic(days, user_id)
    {
        let now = new Date();
        let lastDate = new Date(new Date().setDate(new Date().getDate()-days));
        db.collection('spends').find({"date":{ $gte:lastDate, $lt:now }, "user_id": user_id})
            .toArray(function (err, doc) {
                let productList = [];
                doc.forEach(spend => {
                    if (!isNaN(+spend['amount'])) {
                        if (productList[spend['product_name']] === undefined) {
                            productList[spend['product_name']] = +spend['amount'];
                        } else {
                            productList[spend['product_name']] = +productList[spend['product_name']] + +spend['amount'];
                        }
                    }
                })

                let response = '';

                for (let key in productList) {
                        response += key + '  -  '+ productList[key] +'\n'
                }

                bot.sendMessage(user_id, response, getButtonOptions(block_after_new_spend))
        });
    }

    function addNewProduct(msg)
    {
        let chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
        bot.sendMessage(chat, 'Введите сумму покупки для '+msg.data, getEnterTextOption())
            .then(addApiId => {
                bot.onReplyToMessage(addApiId.chat.id, addApiId.message_id, msg => {
                    let productName = msg.reply_to_message.text.split(' ');
                    productName = productName.slice(-1)[0];

                    db.collection("spends").insert({
                        'user_id': msg.from.id,
                        'product_name': productName,
                        'amount': msg.text,
                        'date': new Date()
                    })
                        .then(response => {
                            bot.sendMessage(chat, 'Готово!', getButtonOptions(block_after_new_spend))
                        })
                })
            })
    }

    function getOptions(doc, msg)
    {
        let text = doc['title'];
        let chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;

        switch (doc['type']) {
            case 'enter_text':
                bot.sendMessage(chat, text, getEnterTextOption())
                    .then(function(sended) {
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
            ),
        };
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