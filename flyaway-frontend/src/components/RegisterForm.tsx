import { useState } from "react";

type Props = {
  onSubmit: (name: string, email: string, password: string) => void;
};

export default function RegisterForm({ onSubmit }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="card shadow p-4" style={{ width: "400px" }}>
        <h3 className="text-center mb-4">Registro</h3>
        <form onSubmit={(e) => {
            e.preventDefault();
            onSubmit(name, email, password);
        }}>

        <div className="form-group mb-3 text-start">
            <label htmlFor="name" className="form-label">Nombre</label>
            <input
            type="text"
            id="name"
            className="form-control"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            />
        </div>

        <div className="form-group mb-3 text-start">
            <label htmlFor="email" className="form-label">Correo electrónico</label>
            <input
            type="email"
            id="email"
            className="form-control"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
        </div>

        <div className="form-group mb-3 text-start">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
            type="password"
            id="password"
            className="form-control"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
        </div>

        <button type="submit" className="btn btn-primary w-100">
            Registrarse
        </button>
        
        </form>

        <hr className="my-4" />

        <button type="button" className="btn btn-outline-danger w-100">
            <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google"
                width="18"
                className="me-2"
            />
            Registrarse con Google
        </button>

        <div className="text-center mt-3">
            <a href="/login">¿Ya tienes cuenta? Inicia sesión</a>
        </div>
    </div>
  );
}