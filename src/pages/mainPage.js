import ProductTable from '../components/main/ProductTable';


function MainPage() {
    
    return(
        <div className="d-flex app-container">
            <div className="main flex-grow-1">
                <ProductTable />
            </div>
        </div>
    );
}
export default MainPage;
