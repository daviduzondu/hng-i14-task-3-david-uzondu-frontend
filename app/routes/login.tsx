import { Container, Card, Button } from "react-bootstrap";
import { BASE_URL } from "../lib/api";
import pkceChallenge from "pkce-challenge";

function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export default function Login() {
  const handleLogin = async () => {
    const pkce = await pkceChallenge();
    const state = generateState();

    sessionStorage.setItem("oauth_state", state);
    sessionStorage.setItem("oauth_code_verifier", pkce.code_verifier);
    sessionStorage.setItem("oauth_code_challenge", pkce.code_challenge);
    sessionStorage.setItem("oauth_code_challenge_method", pkce.code_challenge_method);

    const params = new URLSearchParams({
      state,
      code_challenge: pkce.code_challenge,
      code_challenge_method: pkce.code_challenge_method,
    });

    window.location.href = `${BASE_URL}/auth/github?${params.toString()}`;
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