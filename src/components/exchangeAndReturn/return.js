import { useState } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { returnOutputProductService } from '../../services/exchangeAndReturnServices';
import { getProductByBarOrNoService } from '../../services/productServices';

const ReturnProductModal = ({ show, onClose }) => {
  const [returnedProducts, setReturnedProducts] = useState([
    { product_no: '', quantity: 1, price: 0 }
  ]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleProductChange = async (index, field, value, setter) => {
    const updated = [...returnedProducts];
    updated[index][field] = value;

    setter(updated);
  };

  const addProductField = () => {
    setReturnedProducts([...returnedProducts, { product_no: '', quantity: 1, price: 0 }]);
  };

  const removeProductField = (index) => {
    const updated = [...returnedProducts];
    updated.splice(index, 1);
    setReturnedProducts(updated);
  };

  const handleGetProductData = async (setRows, index, product_no, rows) => {
    try {
        const product = await getProductByBarOrNoService(product_no);
        
        if (!product) {
            setError(`المنتج ${product_no} غير موجود`);
            return;
        }

        const updatedRows = [...rows];
        
        // تحديث بيانات المنتج في السطر الحالي
        updatedRows[index] = {
            ...updatedRows[index],
            price: parseFloat(product.price) || 0,
            product_no: product.product_no,
        };

        setRows(updatedRows);

        setError('');

    } catch (error) {
        setError(`المنتج ${product_no} غير موجود`);
    }
};

  const handleSubmit = async () => {
    setSuccess('');
    setError('');

    const returnData = {
        'returned_products': returnedProducts,
        'note': note,
    };

    for (const element of returnedProducts) {
      if (!element.product_no.trim() || element.quantity <= 0 || element.price <= 0) {
        setError("يرجى تعبئة جميع بيانات المنتجات المرجعة");
        return;
      }
    }

    try {
      setLoading(true);
      const response = await returnOutputProductService(returnData);

      setSuccess(response.message);
      setReturnedProducts([{ product_no: '', quantity: 1, price: 0 }]);
      setNote('');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
        console.log(err);
        
      setError(err.response?.data.error || 'حدث خطأ أثناء الإرسال');
    } finally {
      setLoading(false);
    }
  };

  const totalQuantity = returnedProducts.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const totalValue = returnedProducts.reduce((acc, p) => acc + (p.quantity * p.price), 0);

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>إرجاع منتجات</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <Form>
          {returnedProducts.map((product, index) => (
            <Row className="mb-3" key={index}>
              <Col>
                <Form.Control
                  placeholder="رقم المنتج"
                  value={product.product_no}
                  onChange={(e) =>
                    handleProductChange(index, 'product_no', e.target.value, setReturnedProducts)
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleGetProductData(setReturnedProducts, index, e.target.value, returnedProducts);
                    }
                  }}
                  required
                />
              </Col>
              <Col>
                <Form.Control
                  type="number"
                  min="1"
                  value={product.quantity}
                  onChange={(e) =>
                    handleProductChange(index, 'quantity', parseInt(e.target.value) || 1, setReturnedProducts)
                  }
                  required
                />
              </Col>
              <Col>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="السعر"
                  value={product.price}
                  onChange={(e) =>
                    handleProductChange(index, 'price', parseFloat(e.target.value) || 0, setReturnedProducts)
                  }
                />
              </Col>
              <Col>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="المجموع"
                  value={product.price * product.quantity}
                  readOnly
                />
              </Col>
              <Col xs="auto">
                <Button
                  variant="danger"
                  onClick={() => removeProductField(index)}
                  disabled={returnedProducts.length === 1}
                >
                  حذف
                </Button>
              </Col>
            </Row>
          ))}

          <Button variant="secondary" onClick={addProductField}>
            + إضافة منتج
          </Button>

          <hr />

          <Row className="mb-3">
            <Col>
              <strong>إجمالي الكمية:</strong> {totalQuantity}
            </Col>
            <Col>
              <strong>القيمة الإجمالية:</strong> {totalValue.toFixed(2)} دينار
            </Col>
          </Row>

          <Form.Group className="mt-3">
            <Form.Label>ملاحظات</Form.Label>
            <Form.Control
              type="text"
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
          disabled={
            loading || 
            returnedProducts.some(p => !p.price)
          }
        >
          {loading ? 'جاري الإرسال...' : 'تنفيذ الإرجاع'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReturnProductModal;
