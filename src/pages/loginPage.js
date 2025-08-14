import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authServices";
import { AuthContext } from "../context/AuthContext";  // المسار حسب مكان ملف AuthContext

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setIsLoggedIn } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      setIsLoggedIn(true);
      navigate("/");

    } catch (err) {
      setError(err.response?.data?.message || "فشل في تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="card shadow" style={{ maxWidth: "400px", width: "100%" }}>
            <div className="card-body">
            <h3 className="card-title text-center mb-4">تسجيل الدخول</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                <label htmlFor="email" className="form-label">البريد الإلكتروني</label>
                <input
                    type="email"
                    id="email"
                    className="form-control"
                    placeholder="أدخل البريد الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                </div>

                <div className="mb-3">
                <label htmlFor="password" className="form-label">كلمة المرور</label>
                <input
                    type="password"
                    id="password"
                    className="form-control"
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
                >
                {loading ? "جاري الدخول..." : "تسجيل الدخول"}
                </button>
            </form>
            </div>
        </div>
        </div>
  );
}

export default LoginPage;