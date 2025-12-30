import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { Button, ButtonGroup, Card, CardBody, Col, Container, Row } from "reactstrap";
import { useEffect } from "react";

export default function HomePage() {
  const { me, logout } = useAuth();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const nav = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      login(token);
      nav("/", { replace: true });
    }
  }, [searchParams, login, nav]);

  return (
    <div>
      <div id="homeCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="4000" >
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="0" className="active" aria-current="true" />
          <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="1" />
          <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="2" />
        </div>

        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470" className="d-block w-100" alt="Travel" style={{ height: "400px", objectFit: "cover" }} />
            <div className="carousel-caption d-none d-md-block">
              <h2>Explora el mundo</h2>
              <p>Guarda y comparte tus viajes</p>
            </div>
          </div>

          <div className="carousel-item">
            <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee" className="d-block w-100" alt="Adventure" style={{ height: "400px", objectFit: "cover" }} />
            <div className="carousel-caption d-none d-md-block">
              <h2>Conecta con amigos</h2>
              <p>Descubre viajes de otras personas</p>
            </div>
          </div>

          <div className="carousel-item">
            <img src="https://picsum.photos/id/678/1200/400" className="d-block w-100" alt="Memories" style={{ height: "400px", objectFit: "cover" }} />
            <div className="carousel-caption d-none d-md-block">
              <h2>Crea recuerdos</h2>
              <p>Tu diario de viajes digital</p>
            </div>
          </div>
        </div>

        <button className="carousel-control-prev" type="button" data-bs-target="#homeCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" />
        </button>

        <button className="carousel-control-next" type="button" data-bs-target="#homeCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" />
        </button>
      </div>

      <Container className="text-center mt-5">
        <h1 className="display-4 fw-bold">FlyAway</h1>

        <p className="lead mt-3">
          Organiza tus viajes, comparte experiencias y descubre nuevas aventuras alrededor del mundo.
        </p>

        <p className="text-muted mb-4">
          Guarda fechas, fotos y lugares. Conecta con amigos y descubre sus viajes públicos.
        </p>

        <ButtonGroup className="d-flex justify-content-center gap-3 flex-wrap">
          {!me ? (
            <>
              <Link to="/login" className="btn btn-primary btn-lg">
                <i className="bi bi-box-arrow-in-right me-2"></i>Iniciar sesión
              </Link>
              <Link to="/register" className="btn btn-outline-primary btn-lg">
                <i className="bi bi-person-plus me-2"></i>Crear cuenta
              </Link>
            </>
          ) : (
            <>
              <Link to={`/users/${me?.id}`} className="btn btn-primary btn-lg">
                <i className="bi bi-person-circle me-2"></i>Ir a mi perfil
              </Link>
              <Button color="outline-danger" size="lg" onClick={logout}>
                <i className="bi bi-box-arrow-right me-2"></i>Cerrar sesión
              </Button>
            </>
          )}
        </ButtonGroup>
      </Container>

      <Container className="mt-5">
        <Row className="text-center g-4">
          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <CardBody>
                <i className="bi bi-geo-alt-fill fs-1 text-primary mb-3"></i>
                <h5 className="fw-bold">Registra tus viajes</h5>
                <p className="text-muted">
                  Guarda destinos, fechas y recuerdos de cada aventura.
                </p>
              </CardBody>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <CardBody>
                <i className="bi bi-people-fill fs-1 text-primary mb-3"></i>
                <h5 className="fw-bold">Conecta con amigos</h5>
                <p className="text-muted">
                  Añade amigos y descubre sus viajes públicos.
                </p>
              </CardBody>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <CardBody>
                <i className="bi bi-shield-lock-fill fs-1 text-primary mb-3"></i>
                <h5 className="fw-bold">Controla la privacidad</h5>
                <p className="text-muted">
                  Decide qué viajes son públicos y cuáles solo para ti.
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
