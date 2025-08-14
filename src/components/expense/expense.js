import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { createExpenseService } from '../../services/expenseServices';

const ExpenseModal = ({ show, onClose }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    setSuccessMsg('');
    setErrorMsg('');

    const data = {
        'name': name,
        'amount': amount,
        'note': note,
    };

    setLoading(true);
    try {
      const response = await createExpenseService(data);

      setSuccessMsg(response.message);
      setName('');
      setAmount('');
      setNote('');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      setErrorMsg(
        err?.message || 'حدث خطأ أثناء إضافة المصروف'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>إضافة مصروف</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {successMsg && <Alert variant="success">{successMsg}</Alert>}
        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>اسم المصروف</Form.Label>
            <Form.Control
              type="text"
              placeholder="مثال: إيجار، كهرباء..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>المبلغ</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>ملاحظات</Form.Label>
            <Form.Control
              type="text"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
          disabled={loading || !name || !amount}
        >
          {loading ? 'جارٍ الإرسال...' : 'حفظ المصروف'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExpenseModal;
