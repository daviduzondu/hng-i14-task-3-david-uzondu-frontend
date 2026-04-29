import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Container, Spinner, Alert } from "react-bootstrap";
import api from "../lib/api";
import type { LoginCallbackResponse } from "../types/api";
import { BASE_URL } from "../lib/api";

function getCookie(name: string): string | null {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.trim().split("=");
    if (key === name) {
      return valueParts.join("=");
    }
  }
  return null;
}

function clearCookie(name: string) {
  document.cookie = name + "=; max-age=0; path=/auth/github/callback";
}

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

    const storedState = getCookie("oauth_state");
    const codeVerifier = getCookie("oauth_code_verifier");

    clearCookie("oauth_code_verifier");
    clearCookie("oauth_state");

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
        const response = await api.get<LoginCallbackResponse>(
          `${BASE_URL}/auth/github/callback?code=${code}&code_verifier=${codeVerifier}&state=${stateParam}`
        );
        const data = response.data;

        if (data.status === "success" && data.data) {
          localStorage.setItem("access_token", data.data.access_token);
          localStorage.setItem("username", data.data.username);
          localStorage.setItem("role", data.data.role);
          navigate("/dashboard");
        } else {
          setError("Authentication failed");
        }
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