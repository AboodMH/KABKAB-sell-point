import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import MainPage from './pages/mainPage';
import LogInPage from './pages/loginPage';

function PrivateRoute({ children }) {
  const { isLoggedIn } = useContext(AuthContext);
  return isLoggedIn ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LogInPage/>} />
      <Route path="/" element={<PrivateRoute><MainPage /></PrivateRoute>}/>
    </Routes>
  );
}

export default App;
