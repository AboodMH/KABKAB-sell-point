import { searchProducts, getProductsByIds, getProductByBarOrNo } from '../config/apis'


export const searchProductsService = async (query) => {
    try {
        const response = await searchProducts(query);
        return response.data;
    } catch (error) {
        throw error;
    }
}


export const getProductsByIdsService = async (ids) => {
    try {
        const response = await getProductsByIds(ids);
        return response.data;
    } catch (error) {
        throw error;
    }
}


export const getProductByBarOrNoService = async (barcode) => {
    try {
        const response = await getProductByBarOrNo(barcode);
        return response.data;
    } catch (error) {
        throw error;
    }
}



