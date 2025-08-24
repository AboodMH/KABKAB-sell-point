import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { getProductsByIdsService } from '../../services/productServices';
import {
  getTemporaryOutputsService,
  addTemporaryOutputService,
  updateTemporaryOutputService,
  deleteTemporaryOutputService,
} from '../../services/temporaryServices';

function ProductTable() {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [productsInTable, setProductsInTable] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [editMode, setEditMode] = useState(null); // ID المنتج الذي يتم تعديله

  useEffect(() => {
    getTemporaryProducts();
  }, []);

  const getTemporaryProducts = async () => {
    try {
      const temporaryData = await getTemporaryOutputsService();
      if (temporaryData && temporaryData.length > 0) {
        const ids = temporaryData.map(item => item.product_id);
        const products = await getProductsByIdsService(ids);

        const productWithQNT = products.map(product => {
          const temp = temporaryData.find(item => item.product_id === product.id);
          return {
            id: temp?.id || null,
            product_id: product.id,
            barcode: product.barcode,
            product_no: product.product_no,
            product_name: product.product_name,
            price: temp.price,
            image: product.image,
            quantity: temp?.quantity || 0,
          };
        });
        setProductsInTable(productWithQNT);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAddProductByBarcode = async () => {
    try {
      await addTemporaryOutputService({ barcode: barcodeInput, quantity: 1 });
      setBarcodeInput('');
      await getTemporaryProducts();
    } catch (error) {
      alert(error?.response?.data?.error || 'حدث خطأ غير متوقع');
    }
  };

  const handleQuantityChange = (barcode, newQty) => {
    setProductsInTable(products =>
      products.map(p =>
        p.barcode === barcode ? { ...p, quantity: newQty >= 0 ? newQty : 0 } : p
      )
    );
  };

  const handlePriceChange = (barcode, newPrice) => {
    setProductsInTable(products =>
      products.map(p =>
        p.barcode === barcode ? { ...p, price: newPrice >= 0 ? newPrice : 0 } : p
      )
    );
  };

  const handleSaveEdit = async (product) => {
    try {
      // تحديث الكمية
      await updateTemporaryOutputService(product.id, { quantity: product.quantity, price: product.price });

      window.location.reload();
    } catch (error) {
      alert(error?.response?.data?.error || 'فشل في حفظ التعديلات');
    }
  };

  const handleDeleteProduct = async (id, barcode) => {
    const updatedProducts = productsInTable.filter(p => p.barcode !== barcode);
    setProductsInTable(updatedProducts);
    await deleteTemporaryOutputService(id);
  };

  const totalQuantity = productsInTable.reduce((sum, p) => sum + p.quantity, 0);
  const totalPrice = productsInTable.reduce((sum, p) => sum + p.quantity * p.price, 0);
  const finalPrice = totalPrice - discount;

  return (
    <div className="d-flex">
      <div className="col-md-3">
        <Sidebar
          totalQuantity={totalQuantity}
          totalPrice={totalPrice}
          discount={discount}
          finalPrice={finalPrice}
          onDiscountChange={setDiscount}
        />
      </div>
      <div className="col-md-9 overflow-auto p-4">
        <h4>قائمة المنتجات</h4>
        <input
          type="text"
          className="form-control my-3"
          placeholder="🔍 أدخل أو امسح الباركود هنا ثم اضغط Enter"
          value={barcodeInput}
          autoFocus
          onChange={e => setBarcodeInput(e.target.value.trim())}
          onKeyDown={async e => {
            if (e.key === 'Enter') {
              const trimmedBarcode = barcodeInput.trim();
              if (trimmedBarcode !== '') {
                await handleAddProductByBarcode(trimmedBarcode);
              }
            }
          }}
        />
        <table className="table table-bordered table-striped text-center">
          <thead className="table-dark">
            <tr>
              <th>الباركود</th>
              <th>رقم المنتج</th>
              <th>اسم المنتج</th>
              <th>السعر</th>
              <th>الكمية</th>
              <th>تعديل</th>
              <th>حذف</th>
            </tr>
          </thead>
          <tbody>
            {productsInTable.length === 0 ? (
              <tr>
                <td colSpan="7">لم يتم إضافة أي منتجات بعد</td>
              </tr>
            ) : (
              productsInTable.map(product => (
                <tr key={product.barcode}>
                  <td>{product.barcode}</td>
                  <td>{product.product_no}</td>
                  <td>{product.product_name}</td>
                  <td>
                    {editMode === product.barcode ? (
                      <input
                        type="number"
                        className="form-control"
                        value={product.price}
                        onChange={e =>
                          handlePriceChange(product.barcode, parseFloat(e.target.value) || 0)
                        }
                      />
                    ) : (
                      `${product.price} د.أ`
                    )}
                  </td>
                  <td>
                    {editMode === product.barcode ? (
                      <input
                        type="number"
                        className="form-control"
                        value={product.quantity}
                        onChange={e =>
                          handleQuantityChange(product.barcode, parseInt(e.target.value) || 0)
                        }
                      />
                    ) : (
                      product.quantity
                    )}
                  </td>
                  <td>
                    {editMode === product.barcode ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSaveEdit(product)}
                      >
                        💾
                      </button>
                    ) : (
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => setEditMode(product.barcode)}
                      >
                        ✏️
                      </button>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteProduct(product.id, product.barcode)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductTable;
