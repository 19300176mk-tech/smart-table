import {rules, createComparison} from "../lib/compare.js";

export function initSearching(searchField) {
    // @todo: #5.1 — настроить компаратор
    const searchRule = rules.searchMultipleFields(
        searchField,
        ['date', 'customer', 'seller'],
        false
    );
    
    // Исправлено: передаем массив правил правильно
    const compare = createComparison(
        ['skipEmptyTargetValues'],  // только имена правил
        [searchRule]                 // кастомные правила отдельно
    );

    return (data, state, action) => {
        // @todo: #5.2 — применить компаратор
        return data.filter(row => compare(row, state));
    }
}