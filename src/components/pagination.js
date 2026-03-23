import { getPages } from "../lib/utils.js";

export const initPagination = ({ pages, fromRow, toRow, totalRows }, createPage) => {
    let pageCount = 1;
    
    const pageTemplate = pages.firstElementChild?.cloneNode(true);
    if (pageTemplate) {
        pages.innerHTML = '';
    }

    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;

        if (action) {
            switch (action.name) {
                case 'prev':
                    page = Math.max(1, page - 1);
                    break;
                case 'next':
                    page = Math.min(pageCount, page + 1);
                    break;
                case 'first':
                    page = 1;
                    break;
                case 'last':
                    page = pageCount;
                    break;
                case 'rowsPerPage':
                    page = 1;
                    break;
            }
        }

        return Object.assign({}, query, {
            limit: limit,
            page: page - 1
        });
    };

    const updatePagination = (total, { limit, page }) => {
        const currentPage = page + 1;
        pageCount = Math.ceil(total / limit) || 1;
        
        const from = total ? (currentPage - 1) * limit + 1 : 0;
        const to = Math.min(currentPage * limit, total);
        
        fromRow.textContent = from;
        toRow.textContent = to;
        totalRows.textContent = total;
        
        if (pageTemplate) {
            const visiblePages = getPages(currentPage, pageCount, 5);
            const pageButtons = visiblePages.map(pageNumber => {
                const element = pageTemplate.cloneNode(true);
                return createPage(element, pageNumber, pageNumber === currentPage);
            });
            pages.replaceChildren(...pageButtons);
        }
    };

    return {
        applyPagination,
        updatePagination
    };
};