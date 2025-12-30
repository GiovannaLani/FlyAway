import RegisterForm from "../components/RegisterForm";
import client from "../api/client";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();

  const handleRegister = async (name: string, email: string, password: string) => {
    try {
      await client.post("/auth/register", { name, email, password });
      navigate("/login");
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `http://localhost:3030/api/auth/google`;
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <RegisterForm onSubmit={handleRegister} onGoogleSignIn={handleGoogleSignIn} />
    </div>
  );
}