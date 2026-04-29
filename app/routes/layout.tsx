import { Outlet, useNavigate, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { Container, Navbar, Nav, Button, Image, Spinner } from "react-bootstrap";
import { fetchCurrentUser, logout, type CurrentUser } from "../lib/auth";

const PUBLIC_ROUTES = ["/login", "/auth/github/callback"];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      setIsAuthCheckComplete(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthCheckComplete) return;
    
    const isPublicRoute = PUBLIC_ROUTES.some(route => location.pathname.startsWith(route));
    if (!isPublicRoute && !user) {
      navigate("/login", { replace: true });
    }
  }, [isAuthCheckComplete, user, location.pathname, navigate]);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setIsAuthCheckComplete(false);
    navigate("/login");
  };

  if (location.pathname === "/login") {
    if (!isAuthCheckComplete) {
      return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
          <Spinner animation="border" role="status" />
        </Container>
      );
    }
    return <Outlet />;
  }

  if (!isAuthCheckComplete) {
    return (
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <Spinner animation="border" role="status" />
      </Container>
    );
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
                  src={user?.avatar_url || `https://github.com/${user?.username}.png`}
                  roundedCircle
                  width={32}
                  height={32}
                  className="me-2"
                  alt={user?.username || ""}
                />
                <span className="text-light me-2">{user?.username}</span>
                <span className="badge bg-secondary">{user?.role}</span>
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