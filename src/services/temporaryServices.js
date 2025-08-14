import { addTemporaryOutput, getTemporaryOutputs, updateTemporaryOutput, deleteTemporaryOutput } from '../config/apis';

export const addTemporaryOutputService = async (data) => {
    try {
        const response = await addTemporaryOutput(data);
        return response.data;
    } catch (error) {
        throw error;
    }
}


export const getTemporaryOutputsService = async () => {
    try {
        const response = await getTemporaryOutputs();
        return response.data;
    } catch (error) {
        throw error;
    }
}


export const updateTemporaryOutputService = async (id, data) => {
    try {
        const response = await updateTemporaryOutput(id, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}


export const deleteTemporaryOutputService = async (id) => {
    try {
        const response = await deleteTemporaryOutput(id);
        return response.data;
    } catch (error) {
        throw error;
    }
}




