import { Link } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import { useAuth } from "../auth/AuthProvider";

export default function Footer() {
  const { me } = useAuth();
  
  return (
    <footer className="text-light pt-5 pb-3 mt-5" style={{ backgroundColor: "rgb(13, 110, 253)" }}>
      <Container>
        <Row className="mb-4">
          <Col md={4}>
            <h5 className="fw-bold">FlyAway</h5>
            <p className="text-light">
              Organiza tus viajes, comparte recuerdos y descubre nuevas aventuras alrededor del mundo.
            </p>
          </Col>
          <Col md={4}>
            <h6 className="fw-bold">Enlaces</h6>
            <ul className="list-unstyled">
              <li>
                <Link to="/" className="text-light text-decoration-none">
                  Inicio
                </Link>
              </li>

              {me && (
                <li>
                  <Link to={`/users/${me.id}`} className="text-light text-decoration-none">
                    Mi perfil
                  </Link>
                </li>
              )}

              {me && (
                <li>
                  <Link to="/friends" className="text-light text-decoration-none">
                    Amigos
                  </Link>
                </li>
              )}
            </ul>
          </Col>

          <Col md={4}>
            <h6 className="fw-bold">Síguenos</h6>
            <div className="d-flex gap-3 justify-content-center">
              <a href="#" className="text-light fs-4"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-light fs-4"><i className="bi bi-twitter"></i></a>
              <a href="#" className="text-light fs-4"><i className="bi bi-instagram"></i></a>
              <a href="#" className="text-light fs-4"><i className="bi bi-linkedin"></i></a>
            </div>
          </Col>
        </Row>

        <hr className="border-light" />

        <Row>
          <Col className="text-center text-light">
            &copy; {new Date().getFullYear()} FlyAway. Todos los derechos reservados.
          </Col>
        </Row>
      </Container>
    </footer>
  );
}