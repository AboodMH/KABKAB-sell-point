
function DailyReport({ date, cashier, shift, data}) {
  const {
    total_expense,
    total_payments_cash,
    total_payments_card,
    amount_in_box
  } = data;

  const netValue = total_payments_cash - total_expense;
  const difference = netValue - amount_in_box;
  const netDay = (total_payments_card + total_payments_cash + difference) - total_expense;

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Arial', padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>التقرير اليومي</h2>

      <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th colSpan={1}>التاريخ</th>
            <th colSpan={2}>{date}</th>
          </tr>
          <tr>
            <th colSpan={1}>الكاشير</th>
            <th colSpan={2}>{cashier}</th>
            <th colSpan={1}>الشيفت</th>
            <th colSpan={2}>{shift}</th>
          </tr>
          <tr>
            <th colSpan={1}>الوصف</th>
            <th colSpan={3}>القيمة</th>
          </tr>
        </thead>
        <tbody>
          <tr><td colSpan={1}>مبيعات الفيزا</td><td colSpan={3}>{total_payments_card} دينار</td></tr>
          <tr><td colSpan={1}>مبيعات الكاش</td><td colSpan={3}>{total_payments_cash} دينار</td></tr>          
          <tr><td colSpan={1}>المدفوعات</td><td colSpan={3}>{total_expense} دينار</td></tr>
          <tr><td colSpan={1}>صافي المبيعات</td><td colSpan={3}>{netValue} دينار</td></tr>
          <tr><td colSpan={1}>المبلغ الفعلي</td><td colSpan={3}>{amount_in_box} دينار</td></tr>
          <tr><td colSpan={1}>الفرق</td><td colSpan={3}>{difference} دينار</td></tr>
          <tr><td colSpan={1}>الصافي اليومي</td><td colSpan={3}>{netDay} دينار</td></tr>
        </tbody>
      </table>
    </div>
  );
}

export default DailyReport;
