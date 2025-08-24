import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { createDailyReportService, getDailyReportDataService } from "../../services/dailyReportServices";
import { logout } from '../../services/authServices';
import { Button, Modal } from "react-bootstrap";


const CloseDayModal = ({ show, onClose, userName }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    shift: "full",
    cash: 0,
    card: 0,
    value: 0,
    amount_in_box: 0,
    difference: 0,
    note: "",
    outside: 0,
    expense: 0,
    withdrawal: 0,
    netCash: 0,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setError] = useState("");
  const [successMsg, setSuccess] = useState("");

  const navigate = useNavigate();
  const { setIsLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    if (show) fetchReportData();
    
  }, [show]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const fetchReportData = async () => {
    try {
      const response = await getDailyReportDataService();
      const {
        cash,
        card,
        outside,
        expense,
        withdrawal,
      } = response.data;



      // حساب صافي النقدي
      const netCash = 
        (parseFloat(cash) || 0) 
        - (parseFloat(outside) || 0) 
        - (parseFloat(expense) || 0) 
        - (parseFloat(withdrawal) || 0);

      setFormData(prev => ({
        ...prev,
        cash: cash,
        card: card,
        outside,
        expense,
        withdrawal,
        netCash,
        amount_in_box: prev.amount_in_box,  // يبقى قابل للتعديل من المستخدم
        difference: (parseFloat(prev.amount_in_box) || 0) - (parseFloat(netCash) || 0),
      }));
      
    } catch (error) {
      setError("فشل في تحميل بيانات التقرير المبدئية");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      // لو تغير مبلغ الصندوق نحدث الفرق
      if (name === "amount_in_box") {
        const amountInBox = parseFloat(value) || 0;
        updated.difference = amountInBox - (prev.netCash || 0);
      }

      // لو تغير النقدي cash (نادر) يمكن تحديث صافي النقدي أيضًا حسب الحاجة

      return updated;
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // ارسال كل البيانات لل API كما هي (مع صافي النقدي والمرتجعات والمصاريف والسحوبات)
      await createDailyReportService(formData);

      setSuccess("✅ تم إنشاء التقرير وفتح الملف بنجاح");

      handleLogout();
    } catch (error) {
      setError(error.response?.data?.message || "حدث خطأ أثناء إنشاء التقرير");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Modal show={show} onHide={onClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>إغلاق اليوم وإنشاء تقرير</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          <form>
            <div className="form-group mb-2">
              <label>📅 التاريخ</label>
              <input type="date" name="date" className="form-control" value={formData.date} onChange={handleChange} />
            </div>

            <div className="form-group mb-2">
              <label>🕐 الوردية</label>
              <select name="shift" className="form-control" value={formData.shift} onChange={handleChange}>
                <option value="morning">صباحية</option>
                <option value="evening">مسائية</option>
                <option value="full">كاملة</option>
              </select>
            </div>

            <div className="row">
              <div className="col">
                <label>💵 نقدي (قبل الخصم)</label>
                <input type="number" name="cash" className="form-control" value={(formData.cash).toFixed(2)} readOnly />
              </div>
              <div className="col">
                <label>💳 بطاقة</label>
                <input type="number" name="card" className="form-control" value={(formData.card).toFixed(2)} readOnly />
              </div>
            </div>

            <div className="row mt-2">
              <div className="col">
                <label>🚫 إجمالي المرتجعات</label>
                <input type="number" name="total_outside" className="form-control" value={(formData.outside).toFixed(2)} readOnly />
              </div>
              <div className="col">
                <label>💸 إجمالي المصاريف</label>
                <input type="number" name="total_expense" className="form-control" value={(formData.expense).toFixed(2)} readOnly />
              </div>
              <div className="col">
                <label>💰 إجمالي السحوبات</label>
                <input type="number" name="total_withdrawal" className="form-control" value={(formData.withdrawal).toFixed(2)} readOnly />
              </div>
            </div>

            <div className="row mt-2">
              <div className="col">
                <label>💵 صافي النقدي بعد الخصومات</label>
                <input type="number" name="netCash" className="form-control" value={(formData.netCash).toFixed(2)} readOnly />
              </div>
            </div>

            <div className="row mt-2">
              <div className="col">
                <label>📥 المبلغ في الصندوق</label>
                <input type="number" name="amount_in_box" className="form-control" value={formData.amount_in_box} onChange={handleChange} />
              </div>
              <div className="col">
                <label>🧾 الفرق</label>
                <input type="number" name="difference" className="form-control" value={(formData.difference).toFixed(2)} readOnly />
              </div>
            </div>

            <div className="form-group mt-2">
              <label>📝 ملاحظات</label>
              <input name="note" className="form-control" value={formData.note} onChange={handleChange} />
            </div>
          </form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>إلغاء</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading || formData.amount_in_box === 0}>
            {loading ? "جاري الإغلاق..." : "إغلاق اليوم"}
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default CloseDayModal;
