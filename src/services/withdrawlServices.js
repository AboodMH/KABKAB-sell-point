import { createWithdrwal } from "../config/apis";

export const createWithdrwalService = async (data) => {
    try {
        const response = await createWithdrwal(data);
        return response.data;
    } catch (error) {
        throw error;
    }
}