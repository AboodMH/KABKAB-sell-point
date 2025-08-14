import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { getStaffNameAndIdService } from '../../services/staffServices';
import { createWithdrwalService } from '../../services/withdrawlServices';

const WithdrawlModal = ({ show, onClose }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // 🔁 جلب قائمة الموظفين
  useEffect(() => {

    if (show) {
      fetchEmployees();
    }
  }, [show]);

  const fetchEmployees = async () => {
      try {
        const response = await getStaffNameAndIdService();
        setEmployees(response);
        console.log(response);
        
      } catch (error) {
        
      }
  };

  const handleSubmit = async () => {
    setSuccess('');
    setError('');

    const data = {
        'employee_id': employeeId,
        'amount': amount,
        'note': note,
    };

    setLoading(true);
    try {
      const response = await createWithdrwalService(data);

      setSuccess(response.message);
      setEmployeeId('');
      setAmount('');
      setNote('');
      
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      setError(
        err?.message ||
        err?.error ||
        'حدث خطأ أثناء تنفيذ العملية'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>إضافة عملية سحب</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>اختر الموظف</Form.Label>
            <Form.Select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
            >
              <option value="">-- اختر الموظف --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>المبلغ</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              placeholder="أدخل المبلغ"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>ملاحظة</Form.Label>
            <Form.Control
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="أدخل الملاحظة"
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          إغلاق
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading || !employeeId || !amount}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" /> جاري الحفظ...
            </>
          ) : (
            'حفظ العملية'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WithdrawlModal;
