import { Container, Card, Row, Col, Image, Badge } from "react-bootstrap";
import { getUsername, getRole, isAuthenticated } from "../lib/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export function meta() {
  return [
    { title: "Account - Insighta Labs+" },
    { name: "description", content: "Account Settings" },
  ];
}

export default function Account() {
  const navigate = useNavigate();
  const username = getUsername();
  const role = getRole();

  useEffect(() => {
    if (!isAuthenticated()) {
      sessionStorage.setItem("redirect_after_login", window.location.pathname + window.location.search);
      navigate("/login");
    }
  }, [navigate]);

  return (
    <Container>
      <h2 className="mb-4">Account</h2>
      <Row className="g-4">
        <Col md={6}>
          <Card>
            <Card.Body className="text-center">
              <Image
                src={`https://github.com/${username}.png`}
                roundedCircle
                width={100}
                height={100}
                className="mb-3"
                alt={username || ""}
              />
              <h3>{username}</h3>
              <Badge bg="secondary">{role}</Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Account Details</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Username:</strong> {username}</p>
              <p><strong>Role:</strong> {role}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}