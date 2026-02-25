import {createComparison, defaultRules} from "../lib/compare.js";

// @todo: #4.3 — настроить компаратор
const compare = createComparison(defaultRules);

export function initFiltering(elements, indexes) {
    // @todo: #4.1 — заполнить выпадающие списки опциями
    Object.keys(indexes).forEach((elementName) => {
        if (elements[elementName]) {
            const options = Object.values(indexes[elementName]).map(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                return option;
            });
            elements[elementName].append(...options);
        }
    });

    return (data, state, action) => {
        // @todo: #4.2 — обработать очистку поля
        if (action?.name === 'clear') {
            const fieldName = action.dataset.field;
            if (fieldName) {
                const container = action.closest('.filter-wrapper, .dropdown-select, .range-inputs');
                if (container) {
                    const input = container.querySelector('input, select');
                    if (input) {
                        input.value = '';
                        if (fieldName === 'total') {
                            state.totalFrom = '';
                            state.totalTo = '';
                        } else {
                            state[fieldName] = '';
                        }
                    }
                }
            }
        }

        // @todo: #4.5 — отфильтровать данные используя компаратор
        return data.filter(row => compare(row, state));
    }
}