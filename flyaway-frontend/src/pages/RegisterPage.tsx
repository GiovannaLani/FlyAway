import RegisterForm from "../components/RegisterForm";
import client from "../api/client";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();

  const handleRegister = async (name: string, email: string, password: string) => {
    try {
      await client.post("/users/register", { name, email, password });
      navigate("/login");
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <RegisterForm onSubmit={handleRegister} />
    </div>
  );
}