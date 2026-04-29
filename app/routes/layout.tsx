import { Outlet, useNavigate, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { Container, Navbar, Nav, Button, Image } from "react-bootstrap";
import { getUsername, getRole, clearCredentials, isAuthenticated } from "../lib/auth";
import type { Role } from "../types";

const PUBLIC_ROUTES = ["/login", "/auth/github/callback"];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);

  useEffect(() => {
    setUsername(getUsername());
    setRole(getRole());
    setIsLoggedIn(isAuthenticated());
    setIsAuthCheckComplete(true);
  }, []);

  useEffect(() => {
    if (!isAuthCheckComplete) return;
    
    const isPublicRoute = PUBLIC_ROUTES.some(route => location.pathname.startsWith(route));
    if (!isPublicRoute && !isLoggedIn && location.pathname !== "/login") {
      sessionStorage.setItem("redirect_after_login", location.pathname + location.search);
      navigate("/login", { replace: true });
    }
  }, [isAuthCheckComplete, isLoggedIn, location.pathname, navigate]);

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL_BASE || "http://localhost:6060"}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore errors
    }
    clearCredentials();
    navigate("/login");
  };

  if (location.pathname === "/login") {
    return <Outlet />;
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand href="/dashboard" style={{ fontWeight: 600 }}>
            Insighta Labs+
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto" activeKey={location.pathname}>
              <Nav.Link href="/dashboard">Dashboard</Nav.Link>
              <Nav.Link href="/profiles">Profiles</Nav.Link>
              <Nav.Link href="/search">Search</Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link href="/account" className="d-flex align-items-center">
                <Image
                  src={`https://github.com/${username}.png`}
                  roundedCircle
                  width={32}
                  height={32}
                  className="me-2"
                  alt={username || ""}
                />
                <span className="text-light me-2">{username}</span>
                <span className="badge bg-secondary">{role}</span>
              </Nav.Link>
              <Button variant="outline-light" size="sm" onClick={handleLogout} className="ms-2">
                Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="flex-grow-1"><Outlet /></Container>
      <footer className="bg-light py-3 mt-auto">
        <Container className="text-center text-muted">
          <small>Insighta Labs+ &copy; {new Date().getFullYear()}</small>
        </Container>
      </footer>
    </div>
  );
}