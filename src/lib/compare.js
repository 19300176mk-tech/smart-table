/*
const isEmpty = (value) => {
    return value === undefined ||
        value === null ||
        value === '' ||
        (typeof value === 'number' && isNaN(value));
};

const rules = {
    
    skipNonExistentSourceFields: (source) => (key, sourceValue, targetValue) => {
        if (!Object.prototype.hasOwnProperty.call(source, key)) {
            return { skip: true };
        }
        return { skip: false };
    },

    skipEmptyTargetValues: () => (key, sourceValue, targetValue) => {
        if (isEmpty(targetValue)) {
            return { skip: true };
        }
        return { skip: false };
    },

    failOnEmptySource: () => (key, sourceValue, targetValue) => {
        if (isEmpty(sourceValue)) {
            return { result: false };
        }
        return { continue: true };
    },

    arrayAsRange: () => (key, sourceValue, targetValue) => {
        if (Array.isArray(targetValue)) {
            if (targetValue.length === 2) {
                const [from, to] = targetValue;

                if (!isEmpty(from) && sourceValue < from) {
                    return { result: false };
                }
                if (!isEmpty(to) && sourceValue > to) {
                    return { result: false };
                }
                return { result: true };
            }
            return { result: false };
        }
        return { continue: true };
    },

    stringIncludes: () => (key, sourceValue, targetValue) => {
        if (typeof sourceValue === 'string' && typeof targetValue === 'string') {
            return { result: sourceValue.includes(targetValue) };
        }
        return { continue: true };
    },

    caseInsensitiveStringIncludes: () => (key, sourceValue, targetValue) => {
        if (typeof sourceValue === 'string' && typeof targetValue === 'string') {
            return { result: sourceValue.toLowerCase().includes(targetValue.toLowerCase()) };
        }
        return { continue: true };
    },

    stringExactMatch: () => (key, sourceValue, targetValue) => {
        if (typeof sourceValue === 'string' && typeof targetValue === 'string') {
            return { result: sourceValue === targetValue };
        }
        return { continue: true };
    },

    exactEquality: () => (key, sourceValue, targetValue) => {
        return { result: sourceValue === targetValue };
    },

    deepEquality: () => (key, sourceValue, targetValue) => {
        if (typeof sourceValue === 'object' && sourceValue !== null &&
            typeof targetValue === 'object' && targetValue !== null) {
            try {
                return { result: JSON.stringify(sourceValue) === JSON.stringify(targetValue) };
            } catch (e) {
                return { result: false };
            }
        }
        return { continue: true };
    },

    numericTolerance: (tolerance = 0.001) => (key, sourceValue, targetValue) => {
        if (typeof sourceValue === 'number' && typeof targetValue === 'number') {
            return { result: Math.abs(sourceValue - targetValue) <= tolerance };
        }
        return { continue: true };
    },

    searchMultipleFields: (searchKey, searchFields, caseSensitive = false) => (key, sourceValue, targetValue, source, target) => {
        // Применять это правило только при обработке ключа поиска
        if (key !== searchKey) {
            return { continue: true };
        }

        // Пропустить, если поисковый запрос пуст
        if (isEmpty(targetValue)) {
            return { skip: true };
        }

        // Убедиться, что поисковый запрос это строка
        const searchTerm = String(targetValue);

        // Проверить, содержит ли какое-либо из указанных полей исходного объекта поисковый запрос
        for (const field of searchFields) {
            if (Object.prototype.hasOwnProperty.call(source, field)) {
                const fieldValue = source[field];

                // Пропустить пустые поля исходного объекта
                if (isEmpty(fieldValue)) {
                    continue;
                }

                // Преобразовать в строку, если еще не строка
                const sourceFieldValue = String(fieldValue);

                // Выполнить поиск с учетом опции чувствительности к регистру
                let found = false;
                if (caseSensitive) {
                    found = sourceFieldValue.includes(searchTerm);
                } else {
                    found = sourceFieldValue.toLowerCase().includes(searchTerm.toLowerCase());
                }

                if (found) {
                    return { result: true };
                }
            }
        }

        // Совпадений не найдено ни в одном поле
        return { result: false };
    }
};

const defaultRules = [
    'skipNonExistentSourceFields',
    'skipEmptyTargetValues',
    'failOnEmptySource',
    'arrayAsRange',
    'stringIncludes',
    'exactEquality'
];

function compare(source, target, rulesList) {
    
    if (!source || typeof source !== 'object' || !target || typeof target !== 'object') {
        return false;
    }

    if (!Array.isArray(rulesList) || rulesList.length === 0) {
        throw new Error('Rules list is required for comparison');
    }

    // Проверяем каждое свойство в целевом объекте
    for (const key in target) {
        if (Object.prototype.hasOwnProperty.call(target, key)) {
            const targetValue = target[key];
            const sourceValue = source[key];

            // Применяем каждое правило по порядку
            let skipProperty = false;
            let ruleResult = null;

            for (const rule of rulesList) {
                const ruleOutput = rule(key, sourceValue, targetValue, source, target);

                // Проверяем, нужно ли пропустить это свойство
                if (ruleOutput.skip === true) {
                    skipProperty = true;
                    break;
                }

                // Проверяем, есть ли у нас окончательный результат
                if (ruleOutput.hasOwnProperty('result')) {
                    ruleResult = ruleOutput.result;
                    break;
                }

                // Продолжаем со следующим правилом, если нет окончательного результата
                if (ruleOutput.continue === true) {
                    continue;
                }
            }

            // Переходим к следующему свойству, если это свойство помечено для пропуска
            if (skipProperty) {
                continue;
            }

            // Возвращаем false, если какое-либо правило не выполнено
            if (ruleResult === false) {
                return false;
            }
        }
    }

    // Если мы прошли все проверки без возврата false, возвращаем true
    return true;
}

function createComparison(ruleNames, customRules = []) {
    return (source, target) => {
        const rulesList = [
            ...ruleNames.map(ruleName => {
                // Для правил, которым нужны параметры
                if (ruleName === 'skipNonExistentSourceFields') {
                    return rules[ruleName](source);
                }
                return rules[ruleName]();
            }),
            ...customRules
        ];

        return compare(source, target, rulesList);
    };
}

// Экспортируем компоненты модуля
// Подробнее: это делает функции доступными для импорта в другие файлы,
// что необходимо для модульного подхода в современном JavaScript
export {
    compare,
    rules,
    defaultRules,
    createComparison
}; */