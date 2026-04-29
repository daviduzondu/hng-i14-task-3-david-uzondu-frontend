import { useState, useEffect } from "react";
import { Container, Card, Row, Col, Image, Badge, Spinner } from "react-bootstrap";
import { fetchCurrentUser, type CurrentUser } from "../lib/auth";

export function meta() {
  return [
    { title: "Account - Insighta Labs+" },
    { name: "description", content: "Account Settings" },
  ];
}

export default function Account() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    loadUser();
  }, []);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" />
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">Account</h2>
      <Row className="g-4">
        <Col md={6}>
          <Card>
            <Card.Body className="text-center">
              <Image
                src={user?.avatar_url || `https://github.com/${user?.username}.png`}
                roundedCircle
                width={100}
                height={100}
                className="mb-3"
                alt={user?.username || ""}
              />
              <h3>{user?.username}</h3>
              <Badge bg="secondary">{user?.role}</Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Account Details</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Username:</strong> {user?.username}</p>
              <p><strong>Role:</strong> {user?.role}</p>
              <p><strong>Status:</strong> {user?.is_active ? "Active" : "Inactive"}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}