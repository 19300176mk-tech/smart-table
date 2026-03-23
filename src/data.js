import { makeIndex } from "./lib/utils.js";
import { data as sourceData } from "./data/dataset_1.js";

const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

let sellers;
let customers;
let lastResult;
let lastQuery;

const localSellers = makeIndex(sourceData.sellers, 'id', v => `${v.first_name} ${v.last_name}`);
const localCustomers = makeIndex(sourceData.customers, 'id', v => `${v.first_name} ${v.last_name}`);
const localData = sourceData.purchase_records.map(item => ({
    id: item.receipt_id,
    date: item.date,
    seller: localSellers[item.seller_id],
    customer: localCustomers[item.customer_id],
    total: item.total_amount
}));

const mapRecords = (data) => data.map(item => ({
    id: item.receipt_id,
    date: item.date,
    seller: sellers[item.seller_id],
    customer: customers[item.customer_id],
    total: item.total_amount
}));

const getIndexes = async () => {
    try {
        if (!sellers || !customers) {
            [sellers, customers] = await Promise.all([
                fetch(`${BASE_URL}/sellers`).then(res => res.json()),
                fetch(`${BASE_URL}/customers`).then(res => res.json()),
            ]);
        }
        return { sellers, customers };
    } catch (error) {
        console.error('Error loading from server, using local data:', error);
        return { sellers: localSellers, customers: localCustomers };
    }
};

const getRecords = async (query, isUpdated = false) => {
    try {
        const qs = new URLSearchParams(query);
        const nextQuery = qs.toString();
        
        if (lastQuery === nextQuery && !isUpdated) {
            return lastResult;
        }
        
        const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const records = await response.json();
        
        if (!sellers || !customers) {
            await getIndexes();
        }
        
        lastQuery = nextQuery;
        lastResult = {
            total: records.total,
            items: mapRecords(records.items)
        };
        
        return lastResult;
    } catch (error) {
        console.error('Error fetching from server, using local data:', error);
        return {
            total: localData.length,
            items: localData
        };
    }
};

export default function initData() {
    return {
        getIndexes,
        getRecords
    };
}