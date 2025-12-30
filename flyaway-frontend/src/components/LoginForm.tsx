import { useState } from "react";
import type { FormEvent } from "react";

type Props = {
  onSubmit: (email: string, password: string) => void;
  onGoogleSignIn?: () => void;
};

export default function LoginForm({ onSubmit, onGoogleSignIn }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <div className="card shadow p-4" style={{ width: "400px" }}>
      <h3 className="text-center mb-4">Iniciar Sesión</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3 text-start">
          <label className="form-label">Correo electrónico</label>
          <input
            type="email"
            className="form-control"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group mb-3 text-start">
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-control"
            placeholder="•••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Entrar
        </button>
      </form>

      <hr className="my-4" />

      <button className="btn btn-outline-danger w-100" onClick={onGoogleSignIn}>
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google"
          width="18"
          className="me-2"
        />
        Continuar con Google
      </button>

      <div className="text-center mt-3">
        <a href="/register">¿No tienes cuenta? Regístrate</a>
      </div>
    </div>
  );
}
