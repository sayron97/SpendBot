const tesseract = require("node-tesseract-ocr")
const config = require("./config/env");
const lang = require("./config/lang");
const TelegramBot = require('node-telegram-bot-api');
const token = config.getConfig('tg_api_key');
const MongoClient = require('mongodb').MongoClient;
const mongo_db_url = config.getConfig('mongo_db');
const new_product_button = require("./migrations/blocks").newProductButton();
const block_after_new_spend = require("./migrations/blocks").blockAfterNewSpend();

const tesseract_config = {
    lang: "rus",
    oem: 1,
    psm: 3,
}

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
    });

// THE WORLD!!!. MUDA-MUDA-MUDA-MUDAAAAAA




    function getQuestion(msg) {
        let search_value = msg.data;
        if (typeof msg.data === "undefined") {
             search_value = msg.text;
        }

        switch(search_value) {     //Redirects
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

    function sentStatistic(days, user_id) {
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

    function addNewProduct(msg) {
        let chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
        bot.sendMessage(chat, 'Введите сумму покупки для '+msg.data, getEnterTextOption())
            .then(addApiId => {
                bot.onReplyToMessage(addApiId.chat.id, addApiId.message_id, ({reply_to_message, from: {id},text}) => {
                    const [product_name] = reply_to_message.text.split('Введите сумму покупки для ').slice(1);
                    db.collection("spends")
                        .insert({
                            product_name,
                            'user_id': id,
                            'amount': text,
                            'date': new Date()
                    })
                        .then(response => {
                            bot.sendMessage(chat, 'Готово!', getButtonOptions(block_after_new_spend))
                        })
                })
            })
    }

    function getOptions(doc, msg) {   //Choose type of block and fire event
        let text = doc['title'];
        let chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;

        switch (doc['type']) {
            case 'enter_text':

                bot.sendMessage(chat, text, getEnterTextOption())
                    .then(function(sended) {
                        bot.onReplyToMessage(chat, sended.message_id, function (message) {
                            switch (message.reply_to_message.text){
                                case 'Введите название продукта':
                                    postNewProduct(chat, message)
                                    break
                                case 'Пришлите фото чека':
                                    postNewTab(chat, message)
                                    break
                                default:
                            }
                        });
                    })
                break;

                default:  //buttons type
                    switch (doc.address) {
                    case 'enter_first_letter':
                        db.collection("products").find({}).toArray(function (err, res) {
                            let arr = [];
                            res.forEach(element => {arr.push([element])})
                            bot.sendMessage(chat, text, getButtonOptions(arr));
                        });
                        break;
                    default:
                        bot.sendMessage(chat, text, getButtonOptions(doc['buttons']));
                }
        }
    }


    function postNewTab(chat, message) {
        let photos = message.photo;
        const image =  bot.downloadFile(photos[0].file_id, 'images').then(link => {
            console.log(link)
            tesseract.recognize(link, tesseract_config)
                .then(text => {
                    console.log("Result:", text)
                })
                .catch(error => {
                    console.log(error.message)
                })
        });
      //  console.log(image);
    }

    function postNewProduct(chat, message) {
        db.collection('products').update({text:message.text}, {text:message.text, callback_data:message.text},  { upsert: true }, function (err, res) {
            if (err) throw err;

            let response = 'Добавлено!';
            if(res.result.nModified){
                response = 'Обновлено!';
            }
            bot.sendMessage(chat, response, getButtonOptions(block_after_new_spend));
        });
    }

    function getButtonOptions(buttons) {
        return {
            reply_markup: JSON.stringify({
                inline_keyboard: buttons,
                parse_mode: 'Markdown'
            })
        };
    }

    function getEnterTextOption() {
        return {
            reply_markup: JSON.stringify({ force_reply: true }
            ),
        };
    }
});