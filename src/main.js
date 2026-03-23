import './fonts/ys-display/fonts.css';
import './style.css';

import initData from "./data.js";
import { processFormData } from "./lib/utils.js";

import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";

const api = initData();

function collectState() {
    const formData = new FormData(sampleTable.container);
    const state = processFormData(formData);

    const rowsPerPage = parseInt(state.rowsPerPage) || 10;
    const page = parseInt(state.page ?? 1);

    return {
        ...state,
        rowsPerPage,
        page
    };
}

async function render(action) {
    const state = collectState();
    let query = {};
    
    query = applyPagination(query, state, action);
    query = applyFiltering(query, state, action);
    query = applySearching(query, state, action);
    query = applySorting(query, state, action);
    
    const { total, items } = await api.getRecords(query);
    
    updatePagination(total, query);
    sampleTable.render(items);
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

const applySearching = initSearching('search');
const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

const { applyPagination, updatePagination } = initPagination(
    sampleTable.pagination.elements,
    (element, page, isCurrent) => {
        const input = element.querySelector('input');
        const label = element.querySelector('span');
        if (input) input.value = page;
        if (label) label.textContent = page;
        if (isCurrent && input) input.checked = true;
        return element;
    }
);

const { applyFiltering, updateIndexes } = initFiltering(sampleTable.filter.elements);

async function init() {
    const indexes = await api.getIndexes();
    
    if (indexes && indexes.sellers) {
        updateIndexes(sampleTable.filter.elements, {
            searchBySeller: indexes.sellers
        });
    }
    
    await render();
}

const appRoot = document.querySelector('#app');
if (appRoot) {
    appRoot.appendChild(sampleTable.container);
}

init().catch(console.error);