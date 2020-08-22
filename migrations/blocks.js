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
            parent_button: null
        },
        {
            _id: 2,
            address: 'spends',
            title:'Меню трат',
            buttons: [
                [{ text: 'Записать трату', callback_data: 'new_spend'}],
                [{ text: 'Вывести статистику', callback_data: 'period'}]
            ],
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
            parent_button: ['get_stat','get_all_events']
        },
        {
            _id: 5,
            address: 'Введите первые буквы покупки',
            title:'enter_first_letter',
            parent_button: ['new_spend'],
            type: 'enter_text'
        },
        {
            _id: 6,
            address: 'Выберете покупку',
            title:'choose_spend',
            parent_button: ['enter_first_letter'],
            type: 'choose'
        },
        {
            _id: 7,
            address: 'Укажите цену',
            title:'enter_price',
            parent_button: ['choose_spend'],
            type: 'choose'
        },
    ];
}
