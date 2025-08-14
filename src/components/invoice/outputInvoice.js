import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import PaymentMethods from './PaymentMethods';
import { createOutputInvoiceService } from '../../services/invoiceServices';
import Spinner from 'react-bootstrap/Spinner';

const formatCurrency = (value) =>
  new Intl.NumberFormat('ar-JO', { style: 'currency', currency: 'JOD' }).format(value);

const OutputInvoiceModal = ({ show, onClose, data }) => {
  const { value, quantity } = data;

  const [payments, setPayments] = useState([
    { payment_method: 'cash', amount_paid: value, payment_note: '' }
  ]);
  const [note, setNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [errors, setErrors] = useState({});

  // حالات الرسائل والتحميل
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');


  const finalValue = value;
  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount_paid || 0), 0);
  const remaining = finalValue - totalPaid;
  const change = totalPaid > finalValue ? totalPaid - finalValue : 0;

  const validate = () => {
    let hasError = false;
    const errs = {};

    // التحقق من تكرار نوع الدفع
    const paymentMethods = payments.map(p => p.payment_method);
    const uniqueMethods = new Set(paymentMethods);
    if (uniqueMethods.size !== paymentMethods.length) {
      setErrorMessage('لا يمكن تكرار نفس طريقة الدفع أكثر من مرة.');
      return false;
    }

    payments.forEach((p, i) => {
      if (!p.amount_paid || isNaN(p.amount_paid) || parseFloat(p.amount_paid) <= 0) {
        errs[`payment_${i}`] = 'يرجى إدخال مبلغ صالح';
        hasError = true;
      }
    });
    setErrors(errs);

    if (hasError) return false;

    setErrorMessage(''); // مسح رسالة الخطأ إن لم يكن هناك مشاكل
    return true;
  };


  const handleConfirm = async (withPrint) => {
    setSuccessMessage('');
    setErrorMessage('');

    if (!validate()) return;

    setLoading(true);

    const invoiceData = {
      value,
      quantity,
      note,
      payments,
      with_print: withPrint
    };

    try {
      // 1. إنشاء الفاتورة في Laravel
      const createResponse = await createOutputInvoiceService(invoiceData);

      setSuccessMessage('✅ تم إنشاء الفاتورة بنجاح!');
      
      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'حدث خطأ أثناء العملية');
    } finally {
      setLoading(false);
    }
  };


  const handleNoteChange = (index, value) => {
    const updated = [...payments];
    updated[index].payment_note = value;
    setPayments(updated);
  };

  return (
    <>
      <Modal show={show} onHide={onClose} size="lg" backdrop="static" centered>
        <Modal.Header closeButton>
          <Modal.Title>🧾 إضافة فاتورة إخراج</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="mb-3 text-primary">📊 تفاصيل الفاتورة</h5>
              <div className="table-responsive">
                <table className="table table-bordered text-center">
                  <thead className="table-light">
                    <tr>
                      <th>القيمة</th>
                      <th>الكمية</th>
                      <th className="text-danger">المتبقي</th>
                      <th className="text-success">الباقي</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{formatCurrency(value)}</td>
                      <td>{quantity}</td>
                      <td className="text-danger">
                        {remaining > 0 ? formatCurrency(remaining) : '0'}
                      </td>
                      <td className="text-success">
                        {change > 0 ? formatCurrency(change) : '0'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <PaymentMethods payments={payments} onChange={setPayments} errors={errors} disabled={loading} />

          <div className="text-end">
            <Button
              variant="outline-secondary"
              size="sm"
              className="mt-3"
              onClick={() => setShowNoteModal(true)}
              disabled={loading}
            >
              ✍️ إضافة ملاحظات
            </Button>
          </div>
          {loading && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
              <div className="mt-3 text-primary fs-5">جاري إنشاء الفاتورة...</div>
            </div>
          )}

          {loading && (
            <div className="alert alert-info mt-3 d-flex align-items-center" role="alert">
              <Spinner animation="border" size="sm" className="me-2" />
              جاري إرسال البيانات...
            </div>
          )}
          {successMessage && (
            <div className="alert alert-success mt-3" role="alert">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="alert alert-danger mt-3" role="alert">
              {errorMessage}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="success" onClick={()=>handleConfirm(true)} disabled={loading || payments.some(p => !p.amount_paid)}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                جاري التأكيد...
              </>
            ) : (
              'انشاء وطباعة'
            )}
          </Button>
          <Button variant="success" onClick={()=>handleConfirm(false)} disabled={loading || payments.some(p => !p.amount_paid)}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                جاري التأكيد...
              </>
            ) : (
              'انشاء بدون'
            )}
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            ❌ إغلاق
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showNoteModal} onHide={() => setShowNoteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>📝 الملاحظات</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label className="mb-2">ملاحظة الفاتورة:</label>
          <textarea
            className="form-control mb-4"
            rows="2"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="أدخل ملاحظات عامة عن الفاتورة"
            disabled={loading}
          />

          {payments.map((p, i) => (
            <div key={i} className="mb-3">
              <label>ملاحظة للدفع رقم {i + 1} ({p.payment_method}):</label>
              <input
                type="text"
                className="form-control"
                value={p.payment_note}
                onChange={(e) => handleNoteChange(i, e.target.value)}
                placeholder="ملاحظة لهذا الدفع (اختياري)"
                disabled={loading}
              />
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNoteModal(false)} disabled={loading}>
            إغلاق
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OutputInvoiceModal;
