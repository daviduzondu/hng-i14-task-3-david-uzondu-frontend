import { Container, Card, Button } from "react-bootstrap";
import { BASE_URL } from "../lib/api";

export default function Login() {
  const handleLogin = () => {
    window.location.href = `${BASE_URL}/auth/github`;
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <Card style={{ width: "400px" }} className="text-center">
        <Card.Body className="p-5">
          <h2 className="mb-4">Insighta Labs+</h2>
          <p className="text-muted mb-4">
            Sign in to access the profile intelligence system
          </p>
          <Button variant="dark" size="lg" onClick={handleLogin} className="w-100">
            Continue with GitHub
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}