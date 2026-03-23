const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

let sellers;
let customers;
let lastResult;
let lastQuery;

const mapRecords = (data) => {
    if (!sellers || !customers) return [];
    return data.map(item => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id],
        customer: customers[item.customer_id],
        total: item.total_amount
    }));
};

const getIndexes = async () => {
    if (!sellers || !customers) {
        try {
            const [sellersRes, customersRes] = await Promise.all([
                fetch(`${BASE_URL}/sellers`),
                fetch(`${BASE_URL}/customers`)
            ]);
            sellers = await sellersRes.json();
            customers = await customersRes.json();
            console.log('Indexes loaded:', { sellers, customers });
        } catch (error) {
            console.error('Error loading indexes:', error);
            throw error;
        }
    }
    return { sellers, customers };
};

const getRecords = async (query = {}) => {
    try {

        const params = new URLSearchParams();

        if (query.limit !== undefined) params.append('limit', query.limit);
        if (query.page !== undefined) params.append('page', query.page);

        if (query.search) params.append('search', query.search);
  
        if (query.sort) params.append('sort', query.sort);

        if (query.filter) {
            Object.keys(query.filter).forEach(key => {
                if (query.filter[key]) {
                    params.append(`filter[${key}]`, query.filter[key]);
                }
            });
        }
        
        const queryString = params.toString();
        const url = `${BASE_URL}/records${queryString ? `?${queryString}` : ''}`;
        
        console.log('Fetching:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error('Response status:', response.status);
            throw new Error(`HTTP ${response.status}`);
        }
        
        const records = await response.json();
        console.log('Records received:', records);
        
        if (!sellers || !customers) {
            await getIndexes();
        }
        
        const items = mapRecords(records.items || []);
        
        return {
            total: records.total || 0,
            items: items
        };
    } catch (error) {
        console.error('Error fetching records:', error);
        return { total: 0, items: [] };
    }
};

export default function initData() {
    return {
        getIndexes,
        getRecords
    };
}