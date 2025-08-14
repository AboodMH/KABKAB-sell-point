import { exchangeOutputProduct, returnOutputProduct } from "../config/apis";


export const exchangeOutputProductService = async (data) => {
    try {
        const response = await exchangeOutputProduct(data);
        return response;
    } catch (error) {
        throw error;
    }
}


export const returnOutputProductService = async (data) => {
    try {
        const response = await returnOutputProduct(data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

