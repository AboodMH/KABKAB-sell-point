import { createExpense } from "../config/apis";

export const createExpenseService = async (data) => {
    try {
        const response = await createExpense(data);
        return response.data;
    } catch (error) {
        throw error;
    }
}