import { makeIndex } from "./lib/utils.js";
import { data as sourceData } from "./data/dataset_1.js";

const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

let sellersCache;
let customersCache;
let recordsCache = null;

const mapRecord = (item) => ({
    id: item.receipt_id,
    date: item.date,
    seller: sellersCache?.[item.seller_id] || 'Unknown',
    customer: customersCache?.[item.customer_id] || 'Unknown',
    total: item.total_amount
});

const buildIndexFromArray = (arr, idField, valueGetter) => {
    const result = {};
    arr.forEach(item => {
        result[item[idField]] = valueGetter(item);
    });
    return result;
};

const buildIndexFromObject = (obj) => {
    const result = {};
    Object.keys(obj).forEach(key => {
        result[key] = obj[key];
    });
    return result;
};

const getIndexes = async () => {
    if (sellersCache && customersCache) {
        return { sellers: sellersCache, customers: customersCache };
    }
    
    try {
        const [sellersRes, customersRes] = await Promise.all([
            fetch(`${BASE_URL}/sellers`),
            fetch(`${BASE_URL}/customers`)
        ]);
        
        if (!sellersRes.ok) throw new Error(`Sellers HTTP ${sellersRes.status}`);
        if (!customersRes.ok) throw new Error(`Customers HTTP ${customersRes.status}`);
        
        const sellersRaw = await sellersRes.json();
        const customersRaw = await customersRes.json();

        sellersCache = buildIndexFromObject(sellersRaw);
        customersCache = buildIndexFromObject(customersRaw);
        
        console.log('✅ Справочники загружены с сервера:', {
            sellers: Object.keys(sellersCache).length,
            customers: Object.keys(customersCache).length
        });
        
    } catch (error) {
        console.error('❌ Ошибка загрузки справочников:', error.message);

        const localSellersArray = sourceData.sellers;
        const localCustomersArray = sourceData.customers;
        
        sellersCache = buildIndexFromArray(localSellersArray, 'id', v => `${v.first_name} ${v.last_name}`);
        customersCache = buildIndexFromArray(localCustomersArray, 'id', v => `${v.first_name} ${v.last_name}`);
        
        console.log('📁 Используются локальные справочники:', {
            sellers: Object.keys(sellersCache).length,
            customers: Object.keys(customersCache).length
        });
    }
    
    return { sellers: sellersCache, customers: customersCache };
};

const getAllRecords = async () => {
    if (recordsCache) return recordsCache;
    
    try {
        const response = await fetch(`${BASE_URL}/records`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        let items = data.items || data;
        if (!Array.isArray(items)) {
            items = Object.values(items);
        }
        
        if (!sellersCache || !customersCache) {
            await getIndexes();
        }
        
        recordsCache = items.map(mapRecord);
        console.log('✅ Записи загружены с сервера:', recordsCache.length);
        return recordsCache;
        
    } catch (error) {
        console.error('❌ Ошибка загрузки записей:', error.message);
        
        if (!sellersCache || !customersCache) {
            await getIndexes();
        }
        
        recordsCache = sourceData.purchase_records.map(item => ({
            id: item.receipt_id,
            date: item.date,
            seller: sellersCache?.[item.seller_id] || 'Unknown',
            customer: customersCache?.[item.customer_id] || 'Unknown',
            total: item.total_amount
        }));
        
        console.log('📁 Используются локальные записи:', recordsCache.length);
        return recordsCache;
    }
};

const getRecords = async (query = {}) => {
    let items = await getAllRecords();

    if (query.filter) {
        const f = query.filter;
        items = items.filter(item => {
            if (f.date && item.date !== f.date) return false;
            if (f.customer && !item.customer.toLowerCase().includes(f.customer.toLowerCase())) return false;
            if (f.seller && !item.seller.toLowerCase().includes(f.seller.toLowerCase())) return false;
            if (f.total_from && item.total < parseFloat(f.total_from)) return false;
            if (f.total_to && item.total > parseFloat(f.total_to)) return false;
            return true;
        });
    }

    if (query.search) {
        const s = query.search.toLowerCase();
        items = items.filter(item =>
            item.date.toLowerCase().includes(s) ||
            item.customer.toLowerCase().includes(s) ||
            item.seller.toLowerCase().includes(s)
        );
    }

    if (query.sort) {
        const [field, order] = query.sort.split(':');
        items.sort((a, b) => {
            if (order === 'up') return a[field] > b[field] ? 1 : -1;
            if (order === 'down') return a[field] < b[field] ? 1 : -1;
            return 0;
        });
    }

    const limit = parseInt(query.limit) || 10;
    const page = parseInt(query.page) || 0;
    const start = page * limit;
    const paginatedItems = items.slice(start, start + limit);
    
    return {
        total: items.length,
        items: paginatedItems
    };
};

export default function initData() {
    return {
        getIndexes,
        getRecords
    };
}