import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Container, Spinner, Alert } from "react-bootstrap";
import api, { BASE_URL } from "../lib/api";

export default function GitHubCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");

  useEffect(() => {
    if (!code || !stateParam) {
      setError("Missing required parameters");
      return;
    }

    const storedState = sessionStorage.getItem("oauth_state");
    const codeVerifier = sessionStorage.getItem("oauth_code_verifier");

    sessionStorage.removeItem("oauth_state");
    sessionStorage.removeItem("oauth_code_verifier");
    sessionStorage.removeItem("oauth_code_challenge");
    sessionStorage.removeItem("oauth_code_challenge_method");

    if (!storedState || storedState !== stateParam) {
      console.error("State mismatch - possible CSRF attack");
      setError("Invalid state - please try again");
      return;
    }

    if (!codeVerifier) {
      console.error("Missing code verifier");
      setError("Session expired - please try again");
      return;
    }

    const handleCallback = async () => {
      try {
        await api.get(
          `${BASE_URL}/auth/github/callback?code=${code}&code_verifier=${codeVerifier}&state=${stateParam}`
        );
        navigate("/");
      } catch {
        setError("Authentication failed");
      }
    };
    handleCallback();
  }, [code, stateParam, navigate]);

  if (error) {
    return (
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <Spinner animation="border" role="status" />
      <span className="ms-2">Signing you in...</span>
    </Container>
  );
}