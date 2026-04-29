import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Container, Spinner } from "react-bootstrap";
import api from "../lib/api";
import type { LoginCallbackResponse } from "../types/api";
import { BASE_URL } from "../lib/api";

export default function GitHubCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  useEffect(() => {
    if (code && state) {
      const handleCallback = async () => {
        try {
          const storedState = sessionStorage.getItem("oauth_state");
          const codeVerifier = sessionStorage.getItem("oauth_code_verifier");

          sessionStorage.removeItem("oauth_code_verifier");
          sessionStorage.removeItem("oauth_state");

          if (!storedState || storedState !== state) {
            console.error("State mismatch - possible CSRF attack");
            navigate("/login");
            return;
          }

          if (!codeVerifier) {
            console.error("Missing code verifier");
            navigate("/login");
            return;
          }

          const response = await api.get<LoginCallbackResponse>(
            `${BASE_URL}/auth/github/callback?code=${code}&code_verifier=${codeVerifier}&state=${state}`
          );
          const data = response.data;

          if (data.status === "success" && data.data) {
            localStorage.setItem("access_token", data.data.access_token);
            localStorage.setItem("username", data.data.username);
            localStorage.setItem("role", data.data.role);
            navigate("/dashboard");
          } else {
            navigate("/login");
          }
        } catch {
          navigate("/login");
        }
      };
      handleCallback();
    } else {
      navigate("/login");
    }
  }, [code, state, navigate]);

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <Spinner animation="border" role="status" />
      <span className="ms-2">Signing you in...</span>
    </Container>
  );
}