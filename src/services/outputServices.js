import { getOutputsByInvoiceNo } from "../config/apis";


export const getOutputsByInvoiceNoService = async (invoiceNo) => {
    try {
        const response = await getOutputsByInvoiceNo(invoiceNo);
        return response.data;
    } catch (error) {
        throw error;
    }
}