import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import LoginForm from "../components/LoginForm";
import client from "../api/client";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await client.post("/users/login", { email, password });
      const token = res.data.token;
      if (token) {
        login(token);
        nav("/trips");
      } else {
        alert("Credenciales inválidas");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <LoginForm onSubmit={handleLogin} />
    </div>
  );
}
