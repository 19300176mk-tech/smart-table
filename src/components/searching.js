export function initSearching(searchField) {
    return (query, state, action) => {
        if (action?.name === 'reset') {
            const searchInput = document.querySelector('[data-name="search"]');
            if (searchInput) {
                searchInput.value = '';
            }

            const { search, ...rest } = query;
            return rest;
        }
        
        const searchValue = state[searchField];
        if (searchValue && searchValue.trim()) {
            return {
                ...query,
                search: searchValue.trim()
            };
        }

        const { search, ...rest } = query;
        return rest;
    };
}