import { getPages } from "../lib/utils.js";

export const initPagination = ({ pages, fromRow, toRow, totalRows }, createPage) => {
    let pageCount = 1;
    
    const pageTemplate = pages.firstElementChild?.cloneNode(true);
    if (pageTemplate) {
        pages.innerHTML = '';
    }

    const applyPagination = (query, state, action) => {
        const limit = parseInt(state.rowsPerPage) || 10;
        let page = parseInt(state.page) || 1;

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

        return {
            ...query,
            limit: limit,
            page: page - 1
        };
    };

    const updatePagination = (total, { limit, page }) => {
        const currentPage = (page || 0) + 1;
        const limitNum = parseInt(limit) || 10;
        pageCount = Math.ceil(total / limitNum) || 1;
        
        const from = total ? (currentPage - 1) * limitNum + 1 : 0;
        const to = Math.min(currentPage * limitNum, total);
        
        fromRow.textContent = from;
        toRow.textContent = to;
        totalRows.textContent = total;
        
        if (pageTemplate && pageCount > 0) {
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