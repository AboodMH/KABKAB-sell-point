import axios from "axios";

const API_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
});


const token = localStorage.getItem("kabToken");
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// توكن المصادقة
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// ✅ Auth
export const login = (data) => api.post("/login", data);
export const profile = () => api.get("/profile");
export const logout = () => api.post("/logout");


// ✅ Products
export const searchProducts = (query) => api.get(`/product/search?query=${query}`);
export const getProductsByIds = (ids) => api.get(`/product/ids/${ids}`);
export const getProductByBarOrNo = (barcode) => api.get(`/product/${barcode}`);


// ✅ Temporary Output
export const getTemporaryOutputs = () => api.get("/temporary/output");
export const addTemporaryOutput = (data) => api.post("/temporary/output", data);
export const updateTemporaryOutput = (id, data) => api.put(`/temporary/output/${id}`, data);
export const deleteTemporaryOutput = (id) => api.delete(`/temporary/output/${id}`);
export const clearTemporaryOutputs = () => api.delete("/temporary/output");


// ✅ Output Invoice
export const createOutputInvoice = (data) => api.post("/output/invoice", data);
export const getNextOutputInvoiceNo = () => api.get("/output/invoice/next-invoice-no");
export const updateOutputInvoice = (id, data) => api.put(`/output/invoice/${id}`, data);


// ✅ Output Items
export const getOutputsByInvoiceNo = (invoice_no) => api.get(`/output/${invoice_no}`);
export const updateOutputItem = (id, data) => api.put(`/output/${id}`, data);
export const deleteOutputItem = (id) => api.delete(`/output/${id}`);
export const searchOutputProduct = (data) => api.post("/output/search", data);


// ✅ Payments
export const getPayments = () => api.get("/payment");
export const createPayment = (data) => api.post("/payment", data);
export const updatePayment = (id, data) => api.put(`/payment/${id}`, data);
export const deletePayment = (id) => api.delete(`/payment/${id}`);


// Daily report
export const createDailyReport = (data) => api.post('/daily-report', data);
export const getDailyReportData = () => api.get('/daily-report/data');

// Exchange product
export const exchangeOutputProduct = (data) => api.post('/output/product/exchange', data);


// Return product
export const returnOutputProduct = (data) => api.post('/output/product/return', data);


// staff
export const getStaffNameAndId = () => api.get('/staff/getNameAndId');


// withdrwals
export const createWithdrwal = (data) => api.post('/withdrawl', data)


// expenses
export const createExpense = (data) => api.post('/expense', data)



export default api;






