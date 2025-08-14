// src/services/authServices.js
import {
  login as loginApi,
  logout as logoutApi,
  profile as profileApi,
  setAuthToken,
} from "../config/apis";

// تسجيل الدخول
export const login = async (credentials) => {
  try {
    
    const response = await loginApi(credentials);
    const token = response.data.token;

    // حفظ التوكن وتحديث رأس الطلبات
    localStorage.setItem("kabToken", token);
    setAuthToken(token);

    return response.data;
  } catch (error) {
    throw error;
  }
};

// تسجيل الخروج
export const logout = async () => {
  try {
    await logoutApi();
    localStorage.removeItem("kabToken");
    setAuthToken(null);
  } catch (error) {
    throw error;
  }
};


// جلب بيانات المستخدم
export const getProfile = async () => {
  try {
    const response = await profileApi();
    return response.data.user;
  } catch (error) {
    throw error;
  }
};


// التحقق من حالة تسجيل الدخول
export const isLoggedIn = () => {
  const token = localStorage.getItem("kabToken");
  return !!token; // إرجاع true إذا كان التوكن موجودًا، وإلا false
};




