export function initFiltering(elements) {
    const updateIndexes = (elements, indexes) => {
        const select = elements.searchBySeller;
        if (select && indexes.searchBySeller) {
            const currentValue = select.value;
            select.innerHTML = '<option value="" selected>—</option>';
            
            const sellersList = Object.values(indexes.searchBySeller);
            sellersList.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                select.appendChild(option);
            });
            
            if (currentValue && sellersList.includes(currentValue)) {
                select.value = currentValue;
            }
        }
    };

    const applyFiltering = (query, state, action) => {
        if (action?.name === 'clear') {
            const fieldName = action.dataset?.field;
            if (fieldName) {
                const container = action.closest('.filter-wrapper, .dropdown-select, .range-inputs');
                if (container) {
                    const input = container.querySelector('input, select');
                    if (input) {
                        input.value = '';
                    }
                }
            }

            const { filter, ...rest } = query;
            return rest;
        }

        const filters = {};
        
        if (state.date && state.date.trim()) {
            filters.date = state.date.trim();
        }
        if (state.customer && state.customer.trim()) {
            filters.customer = state.customer.trim();
        }
        if (state.seller && state.seller !== '—' && state.seller.trim()) {
            filters.seller = state.seller.trim();
        }
        if (state.totalFrom && state.totalFrom.trim()) {
            filters.total_from = state.totalFrom.trim();
        }
        if (state.totalTo && state.totalTo.trim()) {
            filters.total_to = state.totalTo.trim();
        }

        if (Object.keys(filters).length > 0) {
            return {
                ...query,
                filter: filters
            };
        }

        const { filter, ...rest } = query;
        return rest;
    };

    return {
        updateIndexes,
        applyFiltering
    };
}