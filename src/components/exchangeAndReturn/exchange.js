import { useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { exchangeOutputProductService } from '../../services/exchangeAndReturnServices';
import { getProductByBarOrNoService } from '../../services/productServices';
import { getOutputsByInvoiceNoService } from '../../services/outputServices';

const ExchangeModal = ({ show, onClose }) => {
  const [returnedProducts, setReturnedProducts] = useState([{ product_number: '', quantity: 1, price: 0 }]);
  const [newProducts, setNewProducts] = useState([{ product_number: '', quantity: 1, price: 0 }]);
  const [payments, setPayments] = useState([{ method: 'cash', amount_paid: 0 }]);
  const [note, setNote] = useState('');
  const [discount, setDiscount] = useState(0);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [outputData, setOutputData] = useState([]);

  const handleAdd = (setter, state) => {
    setter([...state, { product_number: '', quantity: 1, price: 0 }]);
  };

  const handleChange = (index, field, value, state, setter) => {
    const updated = [...state];
    updated[index][field] = field === 'quantity' || field === 'price' ? parseFloat(value) || 0 : value;
    setter(updated);
  };

  const handleGetProductData = async (setRows, index, productNo, rows, state) => {
    try {
      const product = await getProductByBarOrNoService(productNo);
      if (!product) {
        setErrorMessage(`المنتج ${productNo} غير موجود`);
        return;
      }

      if (product.quantity === 0 && state === 'new') {
        setErrorMessage('هذا المنتج غير متوفر');
        return;
      }

      const exists = outputData.some(item => item.product_id === product.id);
      console.log(outputData);
      
      if (!exists && state === 'ret' && invoiceNo) {
        setErrorMessage('هذه الفاتورة لا تحتوي على هذا المنتج');
        return;
      }

      const updatedRows = [...rows];
      
      // تحديث بيانات المنتج في السطر الحالي
      updatedRows[index] = {
        ...updatedRows[index],
        price: parseFloat(product.price) || 0,
      };

      setRows(updatedRows);

    } catch (error) {
      console.error(error);
      setErrorMessage(`المنتج ${productNo} غير موجود`);
    }
  };

  const handleGetOutputData = async (invoiceNo) => {
    try {
      const response = await getOutputsByInvoiceNoService(invoiceNo);
      
      if (!response || response.length === 0) {
        setErrorMessage('هذه الفاتورة غير موجوده او لا تحتوي على منتجات');
        setOutputData([]);
        return;
      }else{
        setErrorMessage('');
        console.log(response);
      
        setOutputData(response);
        setReturnedProducts([{ product_number: '', quantity: 1, price: 0 }]);
        setNewProducts([{ product_number: '', quantity: 1, price: 0 }]);
        setPayments([{ method: 'cash', amount_paid: 0 }]);
        setDiscount(0);
      }
      
      
    } catch (error) {
      setErrorMessage("هذه الفاتورة غير موجوده");
      setOutputData([]);
    }
  }


  const totalReturned = returnedProducts.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  const totalNew = newProducts.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  const difference = totalNew - totalReturned;

  const handleSubmit = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const exchangeData = {
      invoice_no: invoiceNo,
      returned_products: returnedProducts,
      new_products: newProducts,
      note: note,
      discount: discount,
      payments: payments
    };

      // التحقق من المنتجات المرجعة
    for (const element of returnedProducts) {
      if (!element.product_number.trim() || element.quantity <= 0 || element.price <= 0) {
        setErrorMessage("يرجى تعبئة جميع بيانات المنتجات المرجعة");
        return;
      }
    }

    // التحقق من المنتجات الجديدة
    for (const element of newProducts) {
      if (!element.product_number.trim() || element.quantity <= 0 || element.price <= 0) {
        setErrorMessage("يرجى تعبئة جميع بيانات المنتجات الجديدة");
        return;
      }
    }

    const returnedNumbers = returnedProducts.map(p => p.product_number.trim());
    const newNumbers = newProducts.map(p => p.product_number.trim());

    const duplicated = returnedNumbers.find(p => newNumbers.includes(p));
    if (duplicated) {
      setErrorMessage(`المنتج رقم (${duplicated}) موجود في المنتجات المرجعة والجديدة! يرجى تعديله`);
      return;
    }

    const totalPriceRet = returnedProducts.reduce((sum, item) => sum + item.price, 0);
    const totalPriceNew = newProducts.reduce((sum, item) => sum + item.price, 0);

    const diffPrice = totalPriceNew - totalPriceRet;
    // التحقق من الدفعات
    const validPayment = payments.find(p => p.amount_paid > 0);
    if (!validPayment && diffPrice !== 0) {
      setErrorMessage("يرجى تعبئة دفعة واحدة على الأقل بمبلغ أكبر من 0");
      return;
    }
    
    try {
      setLoading(true);

      await exchangeOutputProductService(exchangeData);
      
      setSuccessMessage('✅ تم تنفيذ الاستبدال بنجاح!');
      
      setErrorMessage('');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      setErrorMessage(error.message);
      setSuccessMessage('');
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>استبدال المنتجات</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

        <Form.Group className="mb-3">
          <Form.Label>رقم الفاتورة الأصلية</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل رقم الفاتورة"
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleGetOutputData(e.target.value);                
              }
            }}
          />
        </Form.Group>

        {/* المنتجات المرجعة */}
        <h5>المنتجات المرجعة</h5>
        {returnedProducts.map((item, idx) => (
          <Row key={idx} className="mb-2">
            <Col>
              <Form.Control
                placeholder="رقم المنتج أو الباركود"
                value={item.product_number}
                onChange={(e) => handleChange(idx, 'product_number', e.target.value, returnedProducts, setReturnedProducts)}
                onKeyDown={(e)=>{
                  if (e.key === 'Enter') {
                    handleGetProductData(setReturnedProducts, idx, e.target.value, returnedProducts, 'ret');
                  }
                }}
              />
            </Col>
            <Col>
              <Form.Control
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => handleChange(idx, 'quantity', e.target.value, returnedProducts, setReturnedProducts)}
              />
            </Col>
            <Col>
              <Form.Control
                type="number"
                min={0}
                placeholder="السعر"
                readOnly
                value={item.price}
                onChange={(e) => handleChange(idx, 'price', e.target.value, returnedProducts, setReturnedProducts)}
              />
            </Col>
          </Row>
        ))}
        <Button variant="outline-secondary" size="sm" onClick={() => handleAdd(setReturnedProducts, returnedProducts)}>
          + إضافة منتج مرجع
        </Button>

        <hr />

        {/* المنتجات الجديدة */}
        <h5>المنتجات الجديدة</h5>
        {newProducts.map((item, idx) => (
          <Row key={idx} className="mb-2">
            <Col>
              <Form.Control
                placeholder="رقم المنتج أو الباركود"
                value={item.product_number}
                onChange={(e) => handleChange(idx, 'product_number', e.target.value, newProducts, setNewProducts)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleGetProductData(setNewProducts, idx, e.target.value, newProducts, 'new');
                  }
                }}
              />
            </Col>
            <Col>
              <Form.Control
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => handleChange(idx, 'quantity', e.target.value, newProducts, setNewProducts)}
              />
            </Col>
            <Col>
              <Form.Control
                type="number"
                min={0}
                placeholder="السعر"
                value={item.price}
                onChange={(e) => handleChange(idx, 'price', e.target.value, newProducts, setNewProducts)}
              />
            </Col>
            <Col>
              <Form.Control
                type="number"
                min={0}
                placeholder="المجموع"
                readOnly
                value={item.price * item.quantity}
                onChange={(e) => handleChange(idx, 'totalPrice', e.target.value, newProducts, setNewProducts)}
              />
            </Col>
          </Row>
        ))}
        <Button variant="outline-secondary" size="sm" onClick={() => handleAdd(setNewProducts, newProducts)}>
          + إضافة منتج جديد
        </Button>

        <hr />

        {/* الفرق في القيم */}
        <h5>الفرق بين القيم</h5>
        <Row className="mb-3">
          <Col>
            <Form.Label>مجموع المرجعة</Form.Label>
            <Form.Control type="number" value={totalReturned.toFixed(2)} readOnly />
          </Col>
          <Col>
            <Form.Label>مجموع الجديدة</Form.Label>
            <Form.Control type="number" value={totalNew.toFixed(2)} readOnly />
          </Col>
          <Col>
            <Form.Label>الفرق</Form.Label>
            <Form.Control
              type="number"
              value={difference.toFixed(2)}
              readOnly
              style={{
                backgroundColor: difference > 0 ? '#d1e7dd' : difference < 0 ? '#f8d7da' : '#fff3cd',
                fontWeight: 'bold'
              }}
            />
          </Col>
        </Row>

        {/* الخصم والملاحظات */}
        <Form.Group className="mb-2">
          <Form.Label>ملاحظة</Form.Label>
          <Form.Control type="text" value={note} onChange={(e) => setNote(e.target.value)} />
        </Form.Group>

        <Row className="mb-2">
          <Col>
            <Form.Label>الخصم</Form.Label>
            <Form.Control type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} />
          </Col>
        </Row>

        <hr />

        {/* الدفعات */}
        <h5>الدفعات</h5>
        {payments.map((pay, idx) => (
          <Row key={idx} className="mb-2">
            <Col>
              <Form.Select value={pay.method} onChange={(e) => handleChange(idx, 'method', e.target.value, payments, setPayments)}>
                <option value="cash">نقدًا</option>
                <option value="credit_card">بطاقة</option>
                <option value="click">Click</option>
                <option value="bank_transfer">حوالة بنكية</option>
              </Form.Select>
            </Col>
            <Col>
              <Form.Control
                type="number"
                value={pay.amount_paid}
                onChange={(e) => handleChange(idx, 'amount_paid', e.target.value, payments, setPayments)}
              />
            </Col>
          </Row>
        ))}
        <Button variant="outline-secondary" size="sm" onClick={() => handleAdd(setPayments, payments)}>
          + إضافة دفعة
        </Button>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>إلغاء</Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={
            loading ||
            returnedProducts.some(p => !p.product_number.trim()) ||
            newProducts.some(p => !p.product_number.trim())
          }
        >
          {loading ? 'جاري الإرسال...' : 'تنفيذ الاستبدال'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExchangeModal;
