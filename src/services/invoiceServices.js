import { createOutputInvoice, getNextOutputInvoiceNo } from "../config/apis";

export const createOutputInvoiceService = async (data) => {
    try {
        const response = await createOutputInvoice(data);
        return response.data;
    } catch (error) {
        throw error;
    }
}


export const getNextOutputInvoiceNoService = async () => {
    try {
        const response = await getNextOutputInvoiceNo();
        return response;
    } catch (error) {
        throw error;
    }
}








