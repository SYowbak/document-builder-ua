/**
 * Цей файл призначений для автозаповнення тестових даних у формах документів.
 */
function fillDemoData(type) {
    const form = document.getElementById('document-form');
    if (!form) return;
    let data = {};
    if (type === 'cv') {
        data = {
            firstName: 'Олександр',
            middleName: 'Іванович',
            lastName: 'Петренко',
            phone: '+38 (067) 123-45-67',
            email: 'petrenko@example.com',
            city: 'Київ',
            birthDate: '1990-05-15',
            position: 'Менеджер проектів',
            objective: 'Професійний розвиток у сфері управління проектами.',
            experience: 'ТОВ "Розвиток"\nМенеджер проектів\n2018-2023\n- Керування командою\n- Впровадження нових рішень',
            education: 'КНУ ім. Т. Шевченка\nМенеджмент\n2007-2012',
            skills: 'Управління проектами\nMS Office\nКомунікація',
            languages: 'Українська — рідна\nАнглійська — вище середнього',
            additional: 'Водійське посвідчення категорії B.'
        };
    } else if (type === 'letter') {
        data = {
            organizationName: 'ТОВ "Розвиток"',
            outgoingNumber: '123/2024',
            organizationAddress: 'м. Київ, вул. Хрещатик, 10',
            organizationPhone: '+38 (067) 123-45-67',
            organizationEmail: 'info@rozvytok.ua',
            recipientName: 'Іваненко Марія',
            recipientPosition: 'Директор',
            recipientOrganization: 'ТОВ "Партнер"',
            recipientAddress: 'м. Львів, вул. Городоцька, 50',
            subject: 'Співпраця',
            greeting: 'Шановна',
            content: 'Просимо розглянути можливість співпраці між нашими компаніями.\nДеталі у додатку.',
            closing: 'З повагою,',
            senderName: 'Петренко Олександр',
            senderPosition: 'Менеджер проектів',
            attachments: 'Договір про співпрацю',
            addStamp: 'on'
        };
    } else if (type === 'protocol') {
        data = {
            meetingType: 'Нарада',
            protocolNumber: '7',
            date: '2024-06-15',
            time: '10:00',
            location: 'Київ, офіс ТОВ "Розвиток"',
            chairman: 'Петренко Олександр',
            secretary: 'Іваненко Марія',
            participants: 'Петренко Олександр\nІваненко Марія\nСидоренко Павло',
            agenda: 'Обговорення плану\nЗатвердження бюджету',
            discussion: 'Проведено обговорення ключових питань. Вирішено затвердити бюджет.',
            decisions: 'Затвердити бюджет\nПочати реалізацію проекту'
        };
    }
    // Заповнюємо поля форми
    Object.entries(data).forEach(([key, value]) => {
        const el = form.elements[key];
        if (!el) return;
        if (el.type === 'checkbox') {
            el.checked = value === 'on';
        } else {
            el.value = value;
        }
    });
    // Викликаємо оновлення попереднього перегляду
    if (typeof updatePreview === 'function') updatePreview();
}

/**
 * Додає кнопку "Заповнити для прикладу" до форми після її генерації.
 * Це дозволяє швидко заповнити форму тестовими даними для демонстрації.
 */
(function() {
    const origGenerateForm = window.generateForm;
    window.generateForm = function(type) {
        origGenerateForm(type);
        const form = document.getElementById('document-form');
        if (!form) return;
        // Додаємо кнопку автозаповнення
        const demoBtn = document.createElement('button');
        demoBtn.type = 'button';
        demoBtn.className = 'bg-yellow-400 text-gray-800 px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors';
        demoBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>Заповнити для прикладу';
        demoBtn.onclick = function() { fillDemoData(type); };
        form.prepend(demoBtn);
    };
})(); 