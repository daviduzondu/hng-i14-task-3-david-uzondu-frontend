import { Container, Card, Button } from "react-bootstrap";
import { BASE_URL } from "../lib/api";
import api from "../lib/api";

interface GitHubAuthResponse {
  url: string;
  code_verifier: string;
  state: string;
}

export default function Login() {
  const handleLogin = async () => {
    try {
      const response = await api.get<GitHubAuthResponse>(`${BASE_URL}/auth/github`);
      const data = response.data;
      console.log(data)
      
      if (data.url && data.code_verifier && data.state) {
        sessionStorage.setItem("oauth_code_verifier", data.code_verifier);
        sessionStorage.setItem("oauth_state", data.state);
        window.location.href = data.url;
      }
    } catch {
      console.error("Failed to initiate GitHub login");
    }
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