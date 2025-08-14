// PaymentMethods.jsx

const PaymentMethods = ({ payments = [], onChange, errors = {} }) => {
  const handlePaymentChange = (index, field, value) => {
    const updated = [...payments];
    updated[index][field] = value;
    onChange(updated);
  };

  const handleAddPayment = () => {
    onChange([...payments, { payment_method: 'cash', amount_paid: '', payment_note: '' }]);
  };

  const handleRemovePayment = (index) => {
    const updated = payments.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div>
      <label>طرق الدفع</label>
      {Array.isArray(payments) && payments.map((payment, index) => (
        <div key={index} className="border p-2 mb-2 rounded bg-light">
          <div className="row align-items-center">
            <div className="col-md-4">
              <select
                className="form-select"
                value={payment.payment_method}
                onChange={(e) => handlePaymentChange(index, 'payment_method', e.target.value)}
              >
                <option value="cash">نقدي</option>
                <option value="card">بطاقة ائتمان</option>
                <option value="click">Click</option>
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="number"
                className={`form-control ${errors[`payment_${index}`] ? 'is-invalid' : ''}`}
                placeholder="المبلغ"
                value={payment.amount_paid}
                onChange={(e) => handlePaymentChange(index, 'amount_paid', e.target.value)}
              />
              {errors[`payment_${index}`] && (
                <div className="invalid-feedback">{errors[`payment_${index}`]}</div>
              )}
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="ملاحظة"
                value={payment.payment_note}
                onChange={(e) => handlePaymentChange(index, 'payment_note', e.target.value)}
              />
            </div>
            <div className="col-md-1">
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => handleRemovePayment(index)}
                disabled={payments.length === 1}
              >
                ×
              </button>
            </div>
          </div>
        </div>
      ))}

      <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleAddPayment}>
        إضافة طريقة دفع
      </button>
    </div>
  );
};

export default PaymentMethods;
