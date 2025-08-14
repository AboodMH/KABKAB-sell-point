import { getStaffNameAndId } from "../config/apis";

export const getStaffNameAndIdService = async () => {
    try {
        const response = await getStaffNameAndId();
        return response.data;
    } catch (error) {
        throw error;
    }
}