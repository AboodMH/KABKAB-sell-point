import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getProfile } from '../../services/authServices';
import { AuthContext } from '../../context/AuthContext';
import OutputInvoiceModal from '../invoice/outputInvoice';
import { getNextOutputInvoiceNoService } from '../../services/invoiceServices';
import ExchangeModal from '../exchangeAndReturn/exchange';
import ReturnProductModal from '../exchangeAndReturn/return';
import WithdrawlModal from '../withdrawl/withdrawl';
import ExpenseModal from '../expense/expense';
import CloseDayModal from '../report/closeDay';

function Sidebar({ 
  totalQuantity = 0, 
  totalPrice = 0, 
  finalPrice = 0, 
}) {
  const [clock, setClock] = useState('');
  const [showConfirmationOutputModal, setShowConfirmationOutputModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showWithdrawlModal, setShowWithdrawlModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);


  const navigate = useNavigate();
  const { setIsLoggedIn } = useContext(AuthContext);

  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");


  useEffect(() => {
    handleGetUserData();
    handleGetInvoiceNo();
    const interval = setInterval(() => {
      const now = new Date();
      setClock(now.toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleGetUserData = async () => {
    try {
      const userData = await getProfile();
      setUserId(userData.id);
      setUserName(userData.name);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleGetInvoiceNo = async () => {
    try {
      const response = await getNextOutputInvoiceNoService();
      setInvoiceNo(response.data);
    } catch (error) {
      console.error("Error fetching next invoice number:", error);
      return null;
    }
  };

  const handleOpenInvoiceModal = () => {
    if (totalQuantity <= 0 || totalPrice <= 0) {
      alert('لا يمكن إنشاء فاتورة: لا توجد منتجات مضافة.');
      return;
    }
    setShowConfirmationOutputModal(true);
  };



  return (
    <div className="sidebar d-flex flex-column text-white p-3 bg-dark" style={{ height: '100%' }}>
      <h3 className="text-center mb-4">KABKAB</h3>

      {/* بيانات الكاشير */}
      <div className="bg-light text-dark rounded p-2 mb-3">
        <div className="fw-bold">👤 الكاشير:</div>
        <div>الاسم: <strong>{userName || 'غير متوفر'}</strong></div>
        <div>الرقم: <strong>{userId || 'غير متوفر'}</strong></div>
      </div>

      {/* معلومات الفاتورة */}
      <div className="invoice-info bg-secondary p-3 rounded mb-3">
        <div className="my-1 mb-2 d-flex justify-content-between">
          <strong className='d-flex justify-content-center'>رقم الفاتورة:</strong> {invoiceNo || '---'}
        </div>
        <div className="my-1 d-flex justify-content-between">
          <strong>📦 الكمية:</strong> {totalQuantity}
        </div>
        <div className="my-1 d-flex justify-content-between">
          <strong>💵 المجموع:</strong> {Number(totalPrice).toFixed(2)} د.أ
        </div>
        <button className="btn btn-warning w-100 mt-3" onClick={handleOpenInvoiceModal}>
          إنشاء فاتورة
        </button>
      </div>

      {/* أزرار العمليات */}
      <div className="d-grid gap-2 mb-3">
        <button className="btn btn-outline-light" onClick={()=>setShowExpenseModal(true)}>➕ إضافة مصروف</button>
        <button className="btn btn-outline-light" onClick={()=>setShowWithdrawlModal(true)}>➖ إضافة سحب</button>
        <button className="btn btn-outline-light" onClick={()=>setShowExchangeModal(true)}>🔁 استبدال منتج</button>
        <button className="btn btn-outline-light" onClick={()=>setShowReturnModal(true)}>↩️ إرجاع منتج</button>
        <button className="btn btn-outline-danger" onClick={()=>setShowReportModal(true)}>📅 إغلاق اليوم</button>
      </div>

      {/* زر الخروج */}
      <button onClick={handleLogout} className="btn btn-danger mt-auto">🚪 تسجيل الخروج</button>

      {/* الساعة */}
      <div className="clock mt-4 text-center fw-bold">{clock}</div>

      {/* مودال إنشاء الفاتورة */}
      <OutputInvoiceModal
        data={{
          value: totalPrice,
          quantity: totalQuantity,
          finalPrice
        }}
        show={showConfirmationOutputModal} 
        onClose={() => setShowConfirmationOutputModal(false)} 
      />

      <ExchangeModal
        show={showExchangeModal}
        onClose={() => setShowExchangeModal(false)}
      />

      <ReturnProductModal
        show={showReturnModal}
        onClose={() => setShowReturnModal(false)}
      />

      <WithdrawlModal
        show={showWithdrawlModal}
        onClose={() => setShowWithdrawlModal(false)}
      />

      <ExpenseModal
        show={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
      />

      <CloseDayModal 
        show={showReportModal} 
        onClose={() => setShowReportModal(false)}
        userName={userName}
      />

    </div>
  );
}

export default Sidebar;
