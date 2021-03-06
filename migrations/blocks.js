exports.getBlocks = data => {
    return [
        {
            _id: 1,
            address: '/start',
            title: 'Зачем меня призвали??',
            buttons: [
                [{ text: 'Траты', callback_data: 'spends' }],
                [{ text: 'Напоминания', callback_data: 'events' }]
            ],
            type: 'buttons',
            parent_button: null
        },
        {
            _id: 2,
            address: 'spends',
            title:'Меню трат',
            buttons: [
                [{ text: 'Добавить продукт', callback_data: 'add_new_product'}],
                [{ text: 'Записать трату', callback_data: 'enter_first_letter'}],
                [{ text: 'Фото чека', callback_data: 'tab_photo'}],
                [{ text: 'Вывести статистику', callback_data: 'period'}]
            ],
            type: 'buttons',
            parent_button: ['spends']
        },
        {
            _id: 3,
            address: 'events',
            title:'Напоминания',
            buttons: [
                [{ text: 'Новое напоминание', callback_data: 'new_event'}],
                [{ text: 'Показать все напоминания', callback_data: 'period'}]
            ],
            type: 'buttons',
            parent_button: ['events']
        },
        {
            _id: 4,
            address: 'period',
            title:'Период времени',
            buttons: [
                [{ text: '1', callback_data: '1'}],
                [{ text: '7', callback_data: '7'}],
                [{ text: '30', callback_data: '30'}],
                [{ text: '90', callback_data: '90'}],
                [{ text: '180', callback_data: '180'}],
            ],
            type: 'buttons',
            parent_button: ['get_stat','get_all_events']
        },
        {
            _id: 5,
            address:'enter_first_letter',
            title: 'Выберите продукт',
            parent_button: ['spends'],
            buttons: [],
            type: 'buttons'
        },
        {
            _id: 6,
            title:'choose_spend',
            address: 'Выберете покупку',
            parent_button: ['enter_first_letter'],
            type: 'choose'
        },
        {
            _id: 7,
            address:'enter_price',
            title: 'Укажите цену',
            parent_button: ['choose_spend'],
            type: 'choose'
        },
        {
            _id: 8,
            address:'add_new_product',
            title: 'Введите название продукта',
            parent_button: ['spends'],
            callback_data: 'add_new_product',
            type: 'enter_text'
        },
        {
            _id: 9,
            address:'new_product_done',
            title: 'Готово!',
            parent_button: ['new_product'],
            buttons: [
                [{ text: 'Искать в словаре', callback_data: 'search_words'}],
                [{ text: 'Ввести новое слово', callback_data: 'enter_next_word'}],
            ],
            type: 'choose'
        },
        {
            _id: 10,
            address:'tab_photo',
            title: 'Пришлите фото чека',
            parent_button: ['spends'],
            callback_data: 'tab_photo',
            type: 'enter_text'
        },
    ];
}

exports.newProductButton = data => {
    return [
        [ { text: 'Новый продукт', callback_data: 'new_product' } ]
    ]
}

exports.blockAfterNewSpend = data => {
    return [
        [ { text: 'Добавить еще', callback_data: 'add_more' } ],
        [{ text: 'Назад', callback_data: 'back'}]
    ]
}