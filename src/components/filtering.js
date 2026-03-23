export function initFiltering(elements) {
    const updateIndexes = (elements, indexes) => {
        Object.keys(indexes).forEach((elementName) => {
            const select = elements[elementName];
            if (select) {
                const currentValue = select.value;
                select.innerHTML = '<option value="" selected>—</option>';
                
                const sellersList = Object.values(indexes[elementName]);
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
        });
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
            return query;
        }

        const filter = {};

        if (state.date) {
            filter['filter[date]'] = state.date;
        }
        if (state.customer) {
            filter['filter[customer]'] = state.customer;
        }
        if (state.seller && state.seller !== '—') {
            filter['filter[seller]'] = state.seller;
        }
        if (state.totalFrom) {
            filter['filter[total_from]'] = state.totalFrom;
        }
        if (state.totalTo) {
            filter['filter[total_to]'] = state.totalTo;
        }

        return Object.keys(filter).length ? Object.assign({}, query, filter) : query;
    };

    return {
        updateIndexes,
        applyFiltering
    };
}