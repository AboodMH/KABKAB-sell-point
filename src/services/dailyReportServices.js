import { createDailyReport, getDailyReportData } from "../config/apis";



export const createDailyReportService = async (data) => {
    try {
        const response = await createDailyReport(data);
        return response.data;

    } catch (error) {
        throw error;
    }
}


export const getDailyReportDataService = async () => {
    try {
        const response = await getDailyReportData();
        return response.data;

    } catch (error) {
        throw error;
    }
}



