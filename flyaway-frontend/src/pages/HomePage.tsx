import { useAuth } from "../auth/AuthProvider";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { logout } = useAuth();
  return (
    <div>
      <h1>FlyAway</h1>
      <nav>
        <Link to="/trips">Mis viajes</Link> | <button onClick={logout}>Cerrar sesión</button>
      </nav>
    </div>
  );
}