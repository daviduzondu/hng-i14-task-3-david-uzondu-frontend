import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Container, Spinner, Alert } from "react-bootstrap";
import { BASE_URL } from "../lib/api";

function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length);
    }
  }
  return null;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; max-age=0; path=/`;
  document.cookie = `${name}=; max-age=0; path=/auth/github/callback`;
  document.cookie = `${name}=; max-age=0; path=/auth/github`;
  document.cookie = `${name}=; max-age=0`;
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

    console.log("All cookies:", document.cookie);
    const storedState = getCookie("oauth_state");
    const codeVerifier = getCookie("oauth_code_verifier");

    console.log("storedState from cookie:", storedState);
    console.log("stateParam from URL:", stateParam);
    console.log("codeVerifier from cookie:", codeVerifier);

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
        const response = await fetch(
          `${BASE_URL}/auth/github/callback?code=${code}&code_verifier=${codeVerifier}&state=${stateParam}`,
          {
            credentials: "include",
          }
        );

        if (response.ok) {
          navigate("/");
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