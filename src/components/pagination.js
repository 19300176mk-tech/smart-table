import {getPages} from "../lib/utils.js";

export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    // @todo: #2.3 — подготовить шаблон кнопки для страницы и очистить контейнер
    const pageTemplate = pages.firstElementChild?.cloneNode(true);
    if (pageTemplate) {
        pages.innerHTML = '';
    }

    return (data, state, action) => {
        // @todo: #2.1 — посчитать количество страниц, объявить переменные и константы
        const rowsPerPage = state.rowsPerPage;
        const pageCount = Math.ceil(data.length / rowsPerPage);
        let page = state.page;

        // @todo: #2.6 — обработать действия
        if (action) {
            switch(action.name) {
                case 'prev': page = Math.max(1, page - 1); break;
                case 'next': page = Math.min(pageCount, page + 1); break;
                case 'first': page = 1; break;
                case 'last': page = pageCount; break;
            }
        }

        // @todo: #2.4 — получить список видимых страниц и вывести их
        if (pageTemplate) {
            const visiblePages = getPages(page, pageCount, 5);
            const pageButtons = visiblePages.map(pageNumber => {
                const el = pageTemplate.cloneNode(true);
                const input = el.querySelector('input');
                // Добавляем обработчик для радио-кнопок
                if (input) {
                    input.addEventListener('change', () => {
                        // Это событие будет обработано формой
                    });
                }
                return createPage(el, pageNumber, pageNumber === page);
            });
            pages.replaceChildren(...pageButtons);
        }

        // @todo: #2.5 — обновить статус пагинации
        fromRow.textContent = data.length ? (page - 1) * rowsPerPage + 1 : 0;
        toRow.textContent = Math.min((page * rowsPerPage), data.length);
        totalRows.textContent = data.length;

        // @todo: #2.2 — посчитать сколько строк нужно пропустить и получить срез данных
        const skip = (page - 1) * rowsPerPage;
        return data.slice(skip, skip + rowsPerPage);
    };
};