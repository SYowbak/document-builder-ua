/**
 * Визначення шрифтів TimesNewRoman для pdfmake.
 * Всі файли шрифтів TIMES.ttf, TIMESBD.ttf, TIMESBI.ttf, TIMESI.ttf
 * повинні бути вбудовані у vfs_fonts.js.
 */
pdfMake.fonts = {
    TimesNewRoman: {
        normal: 'TIMES.ttf',
        bold: 'TIMESBD.ttf',
        italics: 'TIMESI.ttf',
        bolditalics: 'TIMESBI.ttf'
    }
};

/**
 * Допоміжна функція для парсингу жирного тексту (використання **текст**)
 * та конвертації його у формат, сумісний з pdfmake.
 * @param {string} textString - Вхідний текстовий рядок, який може містити **жирний текст**.
 * @returns {Array} Масив об'єктів тексту, сумісних з pdfmake.
 */
function parseBoldTextForPdfMake(textString) {
    if (!textString) return [];
    const parts = [];
    const regex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(textString)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ text: textString.substring(lastIndex, match.index) });
        }
        parts.push({ text: match[1], bold: true });
        lastIndex = regex.lastIndex;
    }

    if (lastIndex < textString.length) {
        parts.push({ text: textString.substring(lastIndex) });
    }
    return parts;
}

/**
 * Інтерфейс IDocument - базовий контракт для всіх документів.
 * Всі конкретні документи повинні реалізовувати методи цього інтерфейсу.
 * @interface
 */
class IDocument {
    /**
     * Метод для рендерингу документа в HTML.
     * @returns {string} HTML-код документа.
     */
    render() {
        throw new Error("Method 'render' must be implemented");
    }

    /**
     * Метод для валідації даних документа.
     * @returns {boolean} Результат валідації.
     */
    validate() {
        throw new Error("Method 'validate' must be implemented");
    }

    /**
     * Метод для генерації об'єкта визначення документа для pdfmake.
     * @returns {Object} Об'єкт визначення документа pdfmake.
     */
    getPdfDefinition() {
        throw new Error("Method 'getPdfDefinition' must be implemented");
    }
}

/**
 * Абстрактний клас DocumentCreator - базовий творець документів.
 * Реалізує патерн Factory Method.
 */
class DocumentCreator {
    /**
     * Factory Method - абстрактний метод для створення документів.
     * Кожен конкретний творець повинен реалізувати цей метод.
     * @param {Object} data - Дані для створення документа.
     * @returns {IDocument} Екземпляр документа.
     */
    factoryMethod(data) {
        throw new Error("Factory method must be implemented");
    }

    /**
     * Операція створення документа - використовує factory method.
     * @param {Object} data - Дані документа.
     * @returns {IDocument} Готовий документ.
     */
    createDocument(data) {
        const document = this.factoryMethod(data);
        return document;
    }
}

/**
 * CVDocument - реалізація інтерфейсу IDocument для створення резюме.
 * Створює об'єкт резюме з наданих даних, рендерить його в HTML
 * та генерує визначення для pdfmake.
 */
class CVDocument extends IDocument {
    constructor(data) {
        super();
        this.data = data;
    }

    validate() {
        return this.data.firstName && this.data.lastName && this.data.phone;
    }

    render() {
        const currentDate = new Date().toLocaleDateString('uk-UA');
        return `
            <div class="max-w-4xl mx-auto bg-white p-8 font-['Times_New_Roman']">
                <div class="text-center border-b-2 border-gray-300 pb-6 mb-6">
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">РЕЗЮМЕ</h1>
                    <div class="text-xl font-semibold text-blue-600">
                        ${this.data.firstName} ${this.data.middleName ? this.data.middleName + ' ' : ''}${this.data.lastName}
                    </div>
                    <div class="text-lg text-gray-600 mt-1">${this.data.position || 'Не вказано'}</div>
                </div>

                <div class="grid md:grid-cols-3 gap-8">
                    <div class="md:col-span-1">
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h3 class="font-bold text-lg mb-3 text-gray-800">КОНТАКТНА ІНФОРМАЦІЯ</h3>
                            <div class="space-y-2 text-sm">
                                <div><strong>Телефон:</strong> ${this.data.phone}</div>
                                <div><strong>Email:</strong> ${this.data.email || 'Не вказано'}</div>
                                <div><strong>Місто:</strong> ${this.data.city || 'Не вказано'}</div>
                                <div><strong>Дата народження:</strong> ${this.data.birthDate || 'Не вказано'}</div>
                            </div>
                        </div>

                        ${this.data.skills ? `
                        <div class="bg-gray-50 p-4 rounded-lg mt-4">
                            <h3 class="font-bold text-lg mb-3 text-gray-800">НАВИЧКИ</h3>
                            <div class="text-sm">
                                ${this.data.skills.split('\n').map(skill => 
                                    `<div class="mb-1">• ${skill.trim()}</div>`
                                ).join('')}
                            </div>
                        </div>
                        ` : ''}
                    </div>

                    <div class="md:col-span-2">
                        ${this.data.objective ? `
                        <div class="mb-6">
                            <h3 class="font-bold text-lg mb-3 text-gray-800 border-b border-gray-300 pb-1">ПРОФЕСІЙНА МЕТА</h3>
                            <p class="text-sm text-gray-700 leading-relaxed">${this.data.objective}</p>
                        </div>
                        ` : ''}

                        ${this.data.experience ? `
                        <div class="mb-6">
                            <h3 class="font-bold text-lg mb-3 text-gray-800 border-b border-gray-300 pb-1">ДОСВІД РОБОТИ</h3>
                            <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">${this.data.experience}</div>
                        </div>
                        ` : ''}

                        ${this.data.education ? `
                        <div class="mb-6">
                            <h3 class="font-bold text-lg mb-3 text-gray-800 border-b border-gray-300 pb-1">ОСВІТА</h3>
                            <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">${this.data.education}</div>
                        </div>
                        ` : ''}

                        ${this.data.languages ? `
                        <div class="mb-6">
                            <h3 class="font-bold text-lg mb-3 text-gray-800 border-b border-gray-300 pb-1">МОВИ</h3>
                            <div class="text-sm text-gray-700 leading-relaxed">${this.data.languages}</div>
                        </div>
                        ` : ''}

                        ${this.data.additional ? `
                        <div class="mb-6">
                            <h3 class="font-bold text-lg mb-3 text-gray-800 border-b border-gray-300 pb-1">ДОДАТКОВА ІНФОРМАЦІЯ</h3>
                            <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">${this.data.additional}</div>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <div class="text-right text-xs text-gray-500 mt-8 pt-4 border-t border-gray-200">
                    Створено: ${currentDate}
                </div>
            </div>
        `;
    }

    getPdfDefinition() {
        const currentDate = new Date().toLocaleDateString('uk-UA');

        const content = [
            {
                text: 'РЕЗЮМЕ',
                style: 'header',
                alignment: 'center'
            },
            {
                text: `${this.data.firstName} ${this.data.middleName ? this.data.middleName + ' ' : ''}${this.data.lastName}`,
                style: 'subheader',
                alignment: 'center',
                color: '#2563eb'
            },
            {
                text: this.data.position || 'Не вказано',
                style: 'subsubheader',
                alignment: 'center',
                margin: [0, 5, 0, 15]
            },
            {
                canvas: [{
                    type: 'line',
                    x1: 0, y1: 5,
                    x2: 520, y2: 5,
                    lineWidth: 1,
                    lineColor: '#d1d5db'
                }],
                margin: [0, 0, 0, 20]
            },
            {
                columns: [
                    {
                        width: '30%',
                        stack: [
                            {
                                text: 'КОНТАКТНА ІНФОРМАЦІЯ',
                                style: 'sectionHeader'
                            },
                            { text: `Телефон: ${this.data.phone}`, margin: [0, 5, 0, 0] },
                            { text: `Email: ${this.data.email || 'Не вказано'}` },
                            { text: `Місто: ${this.data.city || 'Не вказано'}` },
                            { text: `Дата народження: ${this.data.birthDate || 'Не вказано'}` }
                        ].concat(this.data.skills ? [
                            {
                                text: 'НАВИЧКИ',
                                style: 'sectionHeader',
                                margin: [0, 15, 0, 0]
                            },
                            {
                                ul: this.data.skills.split('\n').map(skill => skill.trim()),
                                margin: [0, 5, 0, 0]
                            }
                        ] : [])
                    },
                    {
                        width: '70%',
                        stack: [
                            this.data.objective ? {
                                text: 'ПРОФЕСІЙНА МЕТА',
                                style: 'sectionHeader',
                                margin: [0, 0, 0, 5],
                                decoration: 'underline',
                                decorationColor: '#d1d5db'
                            } : null,
                            this.data.objective ? { text: parseBoldTextForPdfMake(this.data.objective), style: 'bodyText', margin: [0, 0, 0, 10] } : null,

                            this.data.experience ? {
                                text: 'ДОСВІД РОБОТИ',
                                style: 'sectionHeader',
                                margin: [0, 0, 0, 5],
                                decoration: 'underline',
                                decorationColor: '#d1d5db'
                            } : null,
                            this.data.experience ? { text: parseBoldTextForPdfMake(this.data.experience), style: 'bodyText', margin: [0, 0, 0, 10] } : null,

                            this.data.education ? {
                                text: 'ОСВІТА',
                                style: 'sectionHeader',
                                margin: [0, 0, 0, 5],
                                decoration: 'underline',
                                decorationColor: '#d1d5db'
                            } : null,
                            this.data.education ? { text: parseBoldTextForPdfMake(this.data.education), style: 'bodyText', margin: [0, 0, 0, 10] } : null,

                            this.data.languages ? {
                                text: 'МОВИ',
                                style: 'sectionHeader',
                                margin: [0, 0, 0, 5],
                                decoration: 'underline',
                                decorationColor: '#d1d5db'
                            } : null,
                            this.data.languages ? { text: parseBoldTextForPdfMake(this.data.languages), style: 'bodyText', margin: [0, 0, 0, 10] } : null,

                            this.data.additional ? {
                                text: 'ДОДАТКОВА ІНФОРМАЦІЯ',
                                style: 'sectionHeader',
                                margin: [0, 0, 0, 5],
                                decoration: 'underline',
                                decorationColor: '#d1d5db'
                            } : null,
                            this.data.additional ? { text: parseBoldTextForPdfMake(this.data.additional), style: 'bodyText', margin: [0, 0, 0, 10] } : null,

                        ].filter(item => item !== null)
                    }
                ],
                columnGap: 20,
                margin: [0, 20, 0, 0]
            },
            {
                text: `Створено: ${currentDate}`,
                alignment: 'right',
                fontSize: 8,
                color: '#6b7280',
                margin: [0, 30, 0, 0]
            }
        ];

        content.splice(content.length - 1, 0, {
            canvas: [{
                type: 'line',
                x1: 0, y1: 5,
                x2: 520, y2: 5,
                lineWidth: 1,
                lineColor: '#e5e7eb'
            }],
            margin: [0, 0, 0, 10]
        });

        return {
            content: content,
            defaultStyle: {
                font: 'TimesNewRoman',
                fontSize: 10,
                alignment: 'left'
            },
            styles: {
                header: {
                    fontSize: 24,
                    bold: true,
                    color: '#1a202c',
                    margin: [0, 0, 0, 10]
                },
                subheader: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 5, 0, 0]
                },
                subsubheader: {
                    fontSize: 14,
                    color: '#4a5568'
                },
                sectionHeader: {
                    fontSize: 12,
                    bold: true,
                    color: '#1a202c',
                    margin: [0, 0, 0, 10]
                },
                bodyText: {
                    fontSize: 10,
                    color: '#4a5568',
                    lineHeight: 1.5
                }
            }
        };
    }
}

/**
 * LetterDocument - продукт для офіційних листів згідно з ДСТУ.
 */
class LetterDocument extends IDocument {
    constructor(data) {
        super();
        this.data = data;
    }

    validate() {
        return this.data.recipientName && this.data.subject && this.data.content;
    }

    render() {
        const currentDate = new Date().toLocaleDateString('uk-UA');
        return `
            <div class="max-w-4xl mx-auto bg-white p-8 font-['Times_New_Roman']">
                <div class="text-center mb-8 border-b-2 border-gray-400 pb-4">
                    <div class="text-lg font-bold">${this.data.organizationName || 'НАЗВА ОРГАНІЗАЦІЇ'}</div>
                    <div class="text-sm text-gray-700 mt-1">
                        ${this.data.organizationAddress || 'Адреса організації'}
                    </div>
                    <div class="text-sm text-gray-700">
                        Тел.: ${this.data.organizationPhone || '+38 (0__) ___-__-__'}, 
                        Email: ${this.data.organizationEmail || 'email@organization.ua'}
                    </div>
                </div>

                <div class="flex justify-between mb-8">
                    <div>
                        <div class="text-sm">№ ${this.data.outgoingNumber || '___'}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm">${currentDate}</div>
                    </div>
                </div>

                <div class="mb-8">
                    <div class="text-sm leading-relaxed">
                        <div><strong>${this.data.recipientPosition || 'Посада'}</strong></div>
                        <div><strong>${this.data.recipientName}</strong></div>
                        <div>${this.data.recipientOrganization || 'Назва організації'}</div>
                        <div class="mt-2">${this.data.recipientAddress || 'Адреса отримувача'}</div>
                    </div>
                </div>

                <div class="mb-6">
                    <div class="text-sm">
                        <strong>Тема:</strong> ${this.data.subject}
                    </div>
                </div>

                <div class="mb-4">
                    <div class="text-sm">
                        ${this.data.greeting || 'Шановний(а)'} ${this.data.recipientName}!
                    </div>
                </div>

                <div class="mb-8">
                    <div class="text-sm leading-relaxed whitespace-pre-line text-justify">
                        ${this.data.content}
                    </div>
                </div>

                <div class="mb-8">
                    <div class="text-sm">
                        ${this.data.closing || 'З повагою,'}
                    </div>
                </div>

                <div class="flex justify-between">
                    <div class="text-sm">
                        <div>${this.data.senderPosition || 'Посада відправника'}</div>
                        <div class="mt-8 w-48 border-b border-gray-400 pb-1">
                            ${this.data.senderName ? this.data.senderName : '&nbsp;'}
                        </div>
                    </div>
                </div>

                ${this.data.attachments ? `
                <div class="mt-8 text-sm">
                    <div><strong>Додатки:</strong></div>
                    <div class="whitespace-pre-line">${this.data.attachments}</div>
                </div>
                ` : ''}

                ${this.data.addStamp === 'on' ? `
                <div class="mt-8 flex items-center">
                    <div class="w-40 h-20 border-2 border-dashed border-gray-400 flex items-center justify-center text-xs text-gray-400">Місце для печатки</div>
                </div>
                ` : ''}
            </div>
        `;
    }

    getPdfDefinition() {
        const currentDate = new Date().toLocaleDateString('uk-UA');

        const content = [
            {
                stack: [
                    { text: this.data.organizationName || 'НАЗВА ОРГАНІЗАЦІЇ', style: 'orgHeader' },
                    { text: this.data.organizationAddress || 'Адреса організації', style: 'orgDetail' },
                    { text: `Тел.: ${this.data.organizationPhone || '+38 (0__) ___-__-__'}, Email: ${this.data.organizationEmail || 'email@organization.ua'}`, style: 'orgDetail' }
                ],
                alignment: 'center',
                margin: [0, 0, 0, 15],
            },
            {
                canvas: [{
                    type: 'line',
                    x1: 0, y1: 5,
                    x2: 520, y2: 5,
                    lineWidth: 1,
                    lineColor: '#d1d5db'
                }],
                margin: [0, 0, 0, 20]
            },
            {
                columns: [
                    { text: `№ ${this.data.outgoingNumber || '___'}`, fontSize: 10 },
                    { text: currentDate, alignment: 'right', fontSize: 10 }
                ],
                margin: [0, 0, 0, 20]
            },
            {
                stack: [
                    { text: this.data.recipientPosition || 'Посада', fontSize: 10, bold: true },
                    { text: this.data.recipientName, fontSize: 10, bold: true },
                    { text: this.data.recipientOrganization || 'Назва організації', fontSize: 10 },
                    { text: this.data.recipientAddress || 'Адреса отримувача', fontSize: 10, margin: [0, 5, 0, 0] }
                ],
                margin: [0, 0, 0, 20]
            },
            {
                text: [{ text: 'Тема:', bold: true }, { text: ` ${this.data.subject}` }],
                fontSize: 10,
                margin: [0, 0, 0, 15]
            },
            {
                text: `${this.data.greeting || 'Шановний(а)'} ${this.data.recipientName}!`,
                fontSize: 10,
                margin: [0, 0, 0, 10]
            },
            {
                text: this.data.content,
                fontSize: 10,
                alignment: 'justify',
                margin: [0, 0, 0, 20]
            },
            {
                text: this.data.closing || 'З повагою,',
                fontSize: 10,
                margin: [0, 0, 0, 0]
            },
            {
                columns: [
                    {
                        width: 'auto',
                        stack: [
                            { text: this.data.senderPosition || 'Посада відправника', fontSize: 10 },
                            {
                                text: this.data.senderName || '',
                                decoration: 'underline',
                                decorationColor: '#a0aec0',
                                margin: [0, 0, 0, 0]
                            }
                        ]
                    },
                    {}
                ],
                margin: [0, 0, 0, 0]
            },
            {
                stack: [
                    this.data.attachments ? {
                        stack: [
                            { text: 'Додатки:', fontSize: 10, bold: true },
                            { text: this.data.attachments, fontSize: 10, margin: [0, 5, 0, 0] }
                        ],
                        margin: [0, 15, 0, 0],
                        alignment: 'left'
                    } : null,
                    this.data.addStamp === 'on' ? {
                        stack: [
                            {
                                canvas: [
                                    { type: 'line', x1: 0, y1: 0, x2: 120, y2: 0, lineWidth: 0.5, lineColor: '#d1d5db', dash: { length: 2, space: 4 } },
                                    { type: 'line', x1: 120, y1: 0, x2: 120, y2: 60, lineWidth: 0.5, lineColor: '#d1d5db', dash: { length: 2, space: 4 } },
                                    { type: 'line', x1: 120, y1: 60, x2: 0, y2: 60, lineWidth: 0.5, lineColor: '#d1d5db', dash: { length: 2, space: 4 } },
                                    { type: 'line', x1: 0, y1: 60, x2: 0, y2: 0, lineWidth: 0.5, lineColor: '#d1d5db', dash: { length: 2, space: 4 } }
                                ]
                            },
                            { text: 'Місце для печатки', fontSize: 10, color: '#aaaaaa', bold: false, alignment: 'left', margin: [20, -36, 0, 0] }
                        ],
                        alignment: 'left',
                        margin: [0, this.data.attachments ? 5 : 20, 0, 0]
                    } : null
                ].filter(item => item !== null),
                alignment: 'left'
            }
        ].filter(item => item !== null);

        return {
            content: content,
            defaultStyle: {
                font: 'TimesNewRoman',
                fontSize: 10,
                alignment: 'left'
            },
            styles: {
                orgHeader: {
                    fontSize: 14,
                    bold: true,
                    color: '#1a202c'
                },
                orgDetail: {
                    fontSize: 10,
                    color: '#4a5568'
                }
            },
            tableLayouts: {
            }
        };
    }
}

/**
 * ProtocolDocument - реалізація інтерфейсу IDocument для створення протоколів зустрічей.
 * Створює об'єкт протоколу з наданих даних, рендерить його в HTML
 * та генерує визначення для pdfmake, дотримуючись українських стандартів.
 */
class ProtocolDocument extends IDocument {
    constructor(data) {
        super();
        this.data = data;
    }

    validate() {
        return this.data.meetingType && this.data.date && this.data.participants;
    }

    render() {
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toLocaleDateString('uk-UA');
        };

        return `
            <div class="max-w-4xl mx-auto bg-white p-8 font-['Times_New_Roman']">
                <div class="text-center mb-8">
                    <h1 class="text-xl font-bold mb-2">ПРОТОКОЛ</h1>
                    <div class="text-lg">${this.data.meetingType}</div>
                </div>

                <div class="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <div class="text-sm space-y-2">
                            <div><strong>№ протоколу:</strong> ${this.data.protocolNumber || 'Не вказано'}</div>
                            <div><strong>Дата проведення:</strong> ${formatDate(this.data.date)}</div>
                            <div><strong>Час проведення:</strong> ${this.data.time || 'Не вказано'}</div>
                            <div><strong>Місце проведення:</strong> ${this.data.location || 'Не вказано'}</div>
                        </div>
                    </div>
                    <div>
                        <div class="text-sm space-y-2">
                            <div><strong>Голова зустрічі:</strong> ${this.data.chairman || 'Не вказано'}</div>
                            <div><strong>Секретар:</strong> ${this.data.secretary || 'Не вказано'}</div>
                        </div>
                    </div>
                </div>

                <div class="mb-8">
                    <h3 class="text-lg font-bold mb-3 border-b border-gray-300 pb-1">ПРИСУТНІ:</h3>
                    <div class="text-sm leading-relaxed whitespace-pre-line">
                        ${this.data.participants}
                    </div>
                </div>

                ${this.data.agenda ? `
                <div class="mb-8">
                    <h3 class="text-lg font-bold mb-3 border-b border-gray-300 pb-1">ПОРЯДОК ДЕННИЙ:</h3>
                    <div class="text-sm leading-relaxed">
                        ${this.data.agenda.split('\n').map((item, index) => 
                            `<div class="mb-2">${index + 1}. ${item.trim()}</div>`
                        ).join('')}
                    </div>
                </div>
                ` : ''}

                ${this.data.discussion ? `
                <div class="mb-8">
                    <h3 class="text-lg font-bold mb-3 border-b border-gray-300 pb-1">ОБГОВОРЕННЯ ТА РІШЕННЯ:</h3>
                    <div class="text-sm leading-relaxed whitespace-pre-line">
                        ${this.data.discussion}
                    </div>
                </div>
                ` : ''}

                ${this.data.decisions ? `
                <div class="mb-8">
                    <h3 class="text-lg font-bold mb-3 border-b border-gray-300 pb-1">УХВАЛЕНО:</h3>
                    <div class="text-sm leading-relaxed">
                        ${this.data.decisions.split('\n').map((decision, index) => 
                            `<div class="mb-3">${index + 1}. ${decision.trim()}</div>`
                        ).join('')}
                    </div>
                </div>
                ` : ''}

                <div class="mt-12 grid md:grid-cols-2 gap-8">
                    <div class="text-sm">
                        <div>Голова зустрічі:</div>
                        <div class="w-48 border-b border-gray-400 pb-1">
                            ${this.data.chairman ? this.data.chairman : '&nbsp;'}
                        </div>
                    </div>
                    <div class="text-sm">
                        <div>Секретар:</div>
                        <div class="w-48 border-b border-gray-400 pb-1">
                            ${this.data.secretary ? this.data.secretary : '&nbsp;'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getPdfDefinition() {
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toLocaleDateString('uk-UA');
        };

        const content = [
            {
                text: 'ПРОТОКОЛ',
                style: 'header',
                alignment: 'center',
                margin: [0, 0, 0, 5]
            },
            {
                text: this.data.meetingType,
                style: 'subheader',
                alignment: 'center',
                margin: [0, 0, 0, 20]
            },
            {
                columns: [
                    {
                        width: '50%',
                        stack: [
                            { text: [{ text: '№ протоколу:', bold: true }, { text: ` ${this.data.protocolNumber || 'Не вказано'}` }] },
                            { text: [{ text: 'Дата проведення:', bold: true }, { text: ` ${formatDate(this.data.date)}` }] },
                            { text: [{ text: 'Час проведення:', bold: true }, { text: ` ${this.data.time || 'Не вказано'}` }] },
                            { text: [{ text: 'Місце проведення:', bold: true }, { text: ` ${this.data.location || 'Не вказано'}` }] }
                        ]
                    },
                    {
                        width: '50%',
                        stack: [
                            { text: [{ text: 'Голова зустрічі:', bold: true }, { text: ` ${this.data.chairman || 'Не вказано'}` }] },
                            { text: [{ text: 'Секретар:', bold: true }, { text: ` ${this.data.secretary || 'Не вказано'}` }] }
                        ]
                    }
                ],
                columnGap: 20,
                fontSize: 10,
                margin: [0, 0, 0, 20]
            },
            {
                text: 'ПРИСУТНІ:',
                style: 'sectionHeader',
                margin: [0, 0, 0, 5],
            },
            {
                canvas: [{
                    type: 'line',
                    x1: 0, y1: 5,
                    x2: 520, y2: 5,
                    lineWidth: 1,
                    lineColor: '#d1d5db'
                }],
                margin: [0, 0, 0, 10]
            },
            {
                text: parseBoldTextForPdfMake(this.data.participants),
                fontSize: 10,
                lineHeight: 1.5,
                margin: [0, 0, 0, 20]
            },
            this.data.agenda ? {
                text: 'ПОРЯДОК ДЕННИЙ:',
                style: 'sectionHeader',
                margin: [0, 0, 0, 5],
            } : null,
            this.data.agenda ? {
                canvas: [{
                    type: 'line',
                    x1: 0, y1: 5,
                    x2: 520, y2: 5,
                    lineWidth: 1,
                    lineColor: '#d1d5db'
                }],
                margin: [0, 0, 0, 10]
            } : null,
            this.data.agenda ? {
                ol: this.data.agenda.split('\n').map(item => parseBoldTextForPdfMake(item.trim())),
                fontSize: 10,
                margin: [0, 0, 0, 20]
            } : null,
            this.data.discussion ? {
                text: 'ОБГОВОРЕННЯ ТА РІШЕННЯ:',
                style: 'sectionHeader',
                margin: [0, 0, 0, 5],
            } : null,
            this.data.discussion ? {
                canvas: [{
                    type: 'line',
                    x1: 0, y1: 5,
                    x2: 520, y2: 5,
                    lineWidth: 1,
                    lineColor: '#d1d5db'
                }],
                margin: [0, 0, 0, 10]
            } : null,
            this.data.discussion ? {
                text: parseBoldTextForPdfMake(this.data.discussion),
                fontSize: 10,
                alignment: 'justify',
                lineHeight: 1.5,
                margin: [0, 0, 0, 20]
            } : null,
            this.data.decisions ? {
                text: 'УХВАЛЕНО:',
                style: 'sectionHeader',
                margin: [0, 0, 0, 5],
            } : null,
            this.data.decisions ? {
                canvas: [{
                    type: 'line',
                    x1: 0, y1: 5,
                    x2: 520, y2: 5,
                    lineWidth: 1,
                    lineColor: '#d1d5db'
                }],
                margin: [0, 0, 0, 10]
            } : null,
            this.data.decisions ? {
                ol: this.data.decisions.split('\n').map(decision => parseBoldTextForPdfMake(decision.trim())),
                fontSize: 10,
                margin: [0, 0, 0, 20]
            } : null,
            {
                columns: [
                    {
                        width: '50%',
                        stack: [
                            { text: 'Голова зустрічі:', fontSize: 10 },
                            {
                                text: parseBoldTextForPdfMake(this.data.chairman || ''),
                            },
                            {
                                canvas: [{
                                    type: 'line',
                                    x1: 0, y1: 5,
                                    x2: 140, y2: 5,
                                    lineWidth: 1,
                                    lineColor: '#a0aec0'
                                }],
                                margin: [0, 0, 0, 0]
                            }
                        ]
                    },
                    {
                        width: '50%',
                        stack: [
                            { text: 'Секретар:', fontSize: 10 },
                            {
                                text: parseBoldTextForPdfMake(this.data.secretary || ''),
                            },
                            {
                                canvas: [{
                                    type: 'line',
                                    x1: 0, y1: 5,
                                    x2: 140, y2: 5,
                                    lineWidth: 1,
                                    lineColor: '#a0aec0'
                                }],
                                margin: [0, 0, 0, 0]
                            }
                        ]
                    }
                ],
                columnGap: 20,
                margin: [0, 40, 0, 0]
            }
        ].filter(item => item !== null);

        return {
            content: content,
            defaultStyle: {
                font: 'TimesNewRoman',
                fontSize: 10,
                alignment: 'left'
            },
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    color: '#1a202c'
                },
                subheader: {
                    fontSize: 14,
                    color: '#4a5568'
                },
                sectionHeader: {
                    fontSize: 12,
                    bold: true,
                    color: '#1a202c'
                }
            }
        };
    }
}

/**
 * CVCreator - творець резюме.
 * Реалізує Factory Method для створення CVDocument.
 */
class CVCreator extends DocumentCreator {
    factoryMethod(data) {
        return new CVDocument(data);
    }
}

/**
 * LetterCreator - творець офіційних листів.
 * Реалізує Factory Method для створення LetterDocument.
 */
class LetterCreator extends DocumentCreator {
    factoryMethod(data) {
        return new LetterDocument(data);
    }
}

/**
 * ProtocolCreator - творець протоколів зустрічей.
 * Реалізує Factory Method для створення ProtocolDocument.
 */
class ProtocolCreator extends DocumentCreator {
    factoryMethod(data) {
        return new ProtocolDocument(data);
    }
}

/**
 * DocumentFactory - головна фабрика документів.
 * Використовує відповідного творця на основі типу документа.
 */
class DocumentFactory {
    static creators = {
        'cv': new CVCreator(),
        'letter': new LetterCreator(),
        'protocol': new ProtocolCreator()
    };

    /**
     * Статичний метод для створення документів.
     * @param {string} type - Тип документа для створення (наприклад, 'cv', 'letter', 'protocol').
     * @param {Object} data - Дані, необхідні для створення документа.
     * @returns {IDocument} Створений екземпляр документа.
     * @throws {Error} Якщо вказаний тип документа невідомий.
     */
    static createDocument(type, data) {
        const creator = this.creators[type];
        if (!creator) {
            throw new Error(`Unknown document type: ${type}`);
        }
        return creator.createDocument(data);
    }
}

/**
 * Логіка UI для взаємодії з користувачем.
 */
let currentDocumentType = null;
let currentDocument = null;
let isDocumentInitiallyGenerated = false;

const previewContainer = document.getElementById('document-preview');
const exportButton = document.getElementById('export-btn');

/**
 * Вибір типу документа та відображення відповідної форми.
 * @param {string} type - Тип документа ('cv', 'letter', 'protocol').
 */
function selectDocumentType(type) {
    currentDocumentType = type;
    document.getElementById('document-selection').classList.add('hidden');
    document.getElementById('document-creator').classList.remove('hidden');
    
    previewContainer.innerHTML = `
        <div class="text-center text-gray-500 mt-20">
            <i class="fas fa-eye text-4xl mb-4"></i>
            <p>Попередній перегляд з'явиться тут після заповнення форми</p>
        </div>
    `;
    
    exportButton.style.display = 'none';
    
    const formTitle = document.getElementById('form-title');
    switch(type) {
        case 'cv':
            formTitle.textContent = 'Створення резюме';
            break;
        case 'letter':
            formTitle.textContent = 'Створення офіційного листа';
            break;
        case 'protocol':
            formTitle.textContent = 'Створення протоколу';
            break;
    }
    
    generateForm(type);
}

/**
 * Повернення до екрану вибору типу документа.
 */
function backToSelection() {
    document.getElementById('document-creator').classList.add('hidden');
    document.getElementById('document-selection').classList.remove('hidden');
    exportButton.style.display = 'none';
    currentDocumentType = null;
    currentDocument = null;
    previewContainer.innerHTML = `
        <div class="text-center text-gray-500 mt-20">
            <i class="fas fa-eye text-4xl mb-4"></i>
            <p>Попередній перегляд з'явиться тут після заповнення форми</p>
        </div>
    `;
}

/**
 * Генерація форми залежно від типу документа.
 * @param {string} type - Тип документа ('cv', 'letter', 'protocol').
 */
function generateForm(type) {
    const formContainer = document.getElementById('document-form');
    const forms = {
        'cv': `
            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Ім'я *</label>
                    <input type="text" name="firstName" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Прізвище *</label>
                    <input type="text" name="lastName" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                </div>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">По батькові</label>
                    <input type="text" name="middleName" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Телефон *</label>
                    <input type="tel" name="phone" required placeholder="+38 (0__) ___-__-__" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                </div>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Місто</label>
                    <input type="text" name="city" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Посада</label>
                <input type="text" name="position" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Професійна мета</label>
                <textarea name="objective" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Досвід роботи</label>
                <textarea name="experience" rows="6" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Освіта</label>
                <textarea name="education" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Навички</label>
                <textarea name="skills" rows="4" placeholder="Кожна навичка з нового рядка" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Мови</label>
                <textarea name="languages" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Додаткова інформація</label>
                <textarea name="additional" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
        `,
        'letter': `
            <div class="space-y-4">
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 class="text-md font-semibold text-blue-800 mb-3">Реквізити організації-відправника</h3>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Назва організації</label>
                            <input type="text" name="organizationName" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Вихідний номер</label>
                            <input type="text" name="outgoingNumber" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Адреса організації</label>
                        <input type="text" name="organizationAddress" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Телефон організації</label>
                            <input type="tel" name="organizationPhone" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email організації</label>
                            <input type="email" name="organizationEmail" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                        </div>
                    </div>
                </div>

                <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 class="text-md font-semibold text-green-800 mb-3">Адресат</h3>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">ПІБ адресата *</label>
                            <input type="text" name="recipientName" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Посада адресата</label>
                            <input type="text" name="recipientPosition" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Організація адресата</label>
                        <input type="text" name="recipientOrganization" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Адреса адресата</label>
                        <input type="text" name="recipientAddress" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                        </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Тема листа *</label>
                    <input type="text" name="subject" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Звернення</label>
                    <input type="text" name="greeting" placeholder="Шановний(а)" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Зміст листа *</label>
                    <textarea name="content" required rows="8" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Заключна формула</label>
                    <input type="text" name="closing" placeholder="З повагою," class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div class="grid md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">ПІБ відправника</label>
                        <input type="text" name="senderName" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Посада відправника</label>
                        <input type="text" name="senderPosition" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Додатки</label>
                    <textarea name="attachments" rows="3" placeholder="Кожен додаток з нового рядка" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
                <div class="flex items-center mt-4">
                    <input type="checkbox" name="addStamp" id="addStamp" class="h-4 w-4 text-blue-600 border-gray-300 rounded">
                    <label for="addStamp" class="ml-2 block text-sm text-gray-900">Додати місце для печатки</label>
                </div>
            </div>
        `,
        'protocol': `
            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Тип заходу *</label>
                    <input type="text" name="meetingType" required placeholder="нарада, засідання, збори" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Номер протоколу</label>
                    <input type="text" name="protocolNumber" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                </div>
            </div>
            <div class="grid md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Дата *</label>
                    <input type="date" name="date" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Час</label>
                    <input type="time" name="time" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Місце проведення</label>
                    <input type="text" name="location" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                </div>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Голова зустрічі</label>
                    <input type="text" name="chairman" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Секретар</label>
                    <input type="text" name="secretary" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Присутні *</label>
                <textarea name="participants" required rows="4" placeholder="Вкажіть ПІБ та посади присутніх, кожного з нового рядка" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Порядок денний</label>
                <textarea name="agenda" rows="4" placeholder="Кожне питання з нового рядка" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Обговорення та рішення</label>
                <textarea name="discussion" rows="6" placeholder="Детальний опис обговорення питань" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ухвалені рішення</label>
                <textarea name="decisions" rows="4" placeholder="Кожне рішення з нового рядка" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
        `
    };
    
    formContainer.innerHTML = forms[type];
    
    const inputs = formContainer.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', (event) => {
            event.target.classList.remove('blink-red');
            if (isDocumentInitiallyGenerated) {
                updatePreview();
            }
        });
    });
}

/**
 * Оновлення попереднього перегляду документа.
 */
function updatePreview() {
    if (!currentDocumentType || !isDocumentInitiallyGenerated) return;
    
    const formData = new FormData(document.getElementById('document-form'));
    const data = Object.fromEntries(formData.entries());
    
    try {
        const createdDocument = DocumentFactory.createDocument(currentDocumentType, data);
        previewContainer.innerHTML = createdDocument.render();
    } catch (error) {
        console.log('Помилка оновлення попереднього перегляду:', error);
    }
}

/**
 * Генерація документа з валідацією.
 * Створює об'єкт документа на основі даних форми,
 * виконує валідацію і відображає попередній перегляд.
 */
function generateDocument() {
    if (!currentDocumentType) return;
    
    const form = document.getElementById('document-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    const allInputs = form.querySelectorAll('input, textarea');
    allInputs.forEach(input => {
        input.classList.remove('blink-red');
    });

    let firstInvalidField = null;
    const requiredInputs = form.querySelectorAll('input[required], textarea[required]');
    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('blink-red');
            if (!firstInvalidField) {
                firstInvalidField = input;
            }
        }
    });

    if (firstInvalidField) {
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const message = document.createElement('div');
        message.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                Будь ласка, заповніть всі обов'язкові поля (позначені *).
            </div>
        `;
        document.querySelector('.container').prepend(message);
        setTimeout(() => message.remove(), 5000);
        return;
    }

    try {
        currentDocument = DocumentFactory.createDocument(currentDocumentType, data);
        
        previewContainer.innerHTML = currentDocument.render();
        
        exportButton.style.display = 'inline-block';
        isDocumentInitiallyGenerated = true;
        
        const message = document.createElement('div');
        message.innerHTML = `
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                <i class="fas fa-check-circle mr-2"></i>
                Документ успішно створено! Тепер ви можете завантажити його як PDF.
            </div>
        `;
        document.querySelector('.container').prepend(message);
        
        setTimeout(() => message.remove(), 5000);
        
    } catch (error) {
        alert('Помилка при створенні документа: ' + error.message);
    }
}

/**
 * Експорт поточного документа в PDF-файл.
 */
async function exportToPDF() {
    if (!currentDocument) {
        alert('Спочатку створіть документ');
        return;
    }

    try {
        const docDefinition = currentDocument.getPdfDefinition();

        docDefinition.defaultStyle = {
            font: 'TimesNewRoman',
            fontSize: 10,
            alignment: 'left'
        };
        /**
         * Ім'я PDF-файлу.
         */
        let fileName = 'document.pdf';

        // Допоміжна функція для форматування дати у назві файлу
        const formatDateForFilename = (dateStr) => {
            if (!dateStr) return '';
            try {
                const date = new Date(dateStr);

                return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch (e) {
                console.error("Помилка форматування дати для назви файлу:", e);
                return dateStr;
            }
        };

        switch (currentDocumentType) {
            case 'cv':
                const firstName = currentDocument.data.firstName || '';
                const lastName = currentDocument.data.lastName || '';
                fileName = `Резюме_${firstName.trim()}_${lastName.trim()}.pdf`.replace(/\s+/g, '_');
                break;
            case 'letter':
                const recipientName = currentDocument.data.recipientName || '';
                const letterDate = formatDateForFilename(currentDocument.data.date);
                fileName = `Лист_${recipientName.trim()}${letterDate ? '_' + letterDate : ''}.pdf`.replace(/\s+/g, '_');
                break;
            case 'protocol':
                const protocolNumber = currentDocument.data.protocolNumber || '';
                const protocolDate = formatDateForFilename(currentDocument.data.date);
                fileName = `Протокол_${protocolNumber.trim()}${protocolDate ? '_' + protocolDate : ''}.pdf`.replace(/\s+/g, '_');
                break;
        }

        pdfMake.createPdf(docDefinition).download(fileName);
        
        const message = document.createElement('div');
        message.innerHTML = `
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                <i class="fas fa-check-circle mr-2"></i>
                Документ успішно завантажено як PDF!
            </div>
        `;
        document.querySelector('.container').prepend(message);
        
        setTimeout(() => message.remove(), 5000);

    } catch (error) {
        console.error('Помилка при експорті в PDF:', error);
        alert('Помилка при експорті в PDF: ' + error.message);
    }
}

/**
 * Ініціалізація додатку при завантаженні сторінки.
 * Виводить інформацію про завантаження та доступні типи документів.
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Конструктор документів завантажено');
    console.log('Доступні типи документів:', Object.keys(DocumentFactory.creators));
}); 