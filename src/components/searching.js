export function initSearching(searchField) {
    return (query, state, action) => {
        if (action?.name === 'reset') {
            const searchInput = document.querySelector('[data-name="search"]');
            if (searchInput) {
                searchInput.value = '';
            }
            return query;
        }
        
        const searchValue = state[searchField];
        return searchValue ? Object.assign({}, query, {
            search: searchValue
        }) : query;
    };
}