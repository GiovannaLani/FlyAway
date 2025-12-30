import { Navbar, NavbarBrand, NavbarToggler, Collapse, Nav, NavItem, NavLink, Button, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import defaultAvatar from "../assets/default-profile-avatar.jpg";

export default function Header() {
  const { me, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <Navbar color="primary" dark expand="lg" fixed="top" className="shadow-sm" >
      <div className="container d-flex align-items-center">
        <NavbarBrand tag={Link} to="/" className="fw-bold d-flex align-items-center" >
          <i className="bi bi-airplane me-2"></i>
          FlyAway
        </NavbarBrand>

        <NavbarToggler onClick={() => setOpen(!open)} className="ms-auto" />

        <Collapse isOpen={open} navbar>
          <Nav className="ms-auto align-items-lg-center gap-lg-2" navbar>
            {!me ? (
              <>
                <NavItem>
                  <NavLink tag={Link} to="/login">
                    Iniciar sesión
                  </NavLink>
                </NavItem>

                <NavItem>
                  <Button color="light" outline size="sm" tag={Link} to="/register" >
                    Crear cuenta
                  </Button>
                </NavItem>
              </>
            ) : (
              <>
                <NavItem>
                  <NavLink tag={Link} to="/">
                    <i className="bi bi-house me-1"></i>
                    Inicio
                  </NavLink>
                </NavItem>

                <NavItem>
                  <NavLink tag={Link} to="/friends">
                    <i className="bi bi-people me-1"></i>
                    Amigos
                  </NavLink>
                </NavItem>

                <NavItem>
                  <Button color="light" size="sm" tag={Link} to="/trips/new" >
                    <i className="bi bi-plus-circle me-1"></i>
                    Nuevo viaje
                  </Button>
                </NavItem>

                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret className="d-flex align-items-center gap-2" >
                    <img
                      src={ me.avatarUrl ? `http://localhost:3001${me.avatarUrl}` : defaultAvatar }
                      alt="avatar"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                    <span className="d-none d-lg-inline">
                      {me.name}
                    </span>
                  </DropdownToggle>

                  <DropdownMenu end>
                    <DropdownItem tag={Link} to={`/users/${me.id}`}>
                      <i className="bi bi-person me-2"></i>
                      Mi perfil
                    </DropdownItem>
                    <DropdownItem tag={Link} to="/profile/edit">
                      <i className="bi bi-gear me-2"></i>
                      Ajustes
                    </DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem onClick={logout} className="text-danger">
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Cerrar sesión
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </>
            )}
          </Nav>
        </Collapse>
      </div>
    </Navbar>
  );
}