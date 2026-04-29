import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Container, Card, Row, Col, Button, Spinner } from "react-bootstrap";
import { request } from "../lib/api";
import type { Profile } from "../types";
import { formatGender, formatAgeGroup, formatProbability, formatDateTime } from "../lib/utils";
import { isAuthenticated } from "../lib/auth";
import { useEffect } from "react";

interface ProfileApiResponse {
  status: string;
  data: Profile;
}

export function meta() {
  return [
    { title: "Profile Detail - Insighta Labs+" },
    { name: "description", content: "Profile Detail View" },
  ];
}

export default function ProfileDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const checkAuth = isAuthenticated();
  useEffect(() => {
    if (!checkAuth) {
      sessionStorage.setItem("redirect_after_login", window.location.pathname + window.location.search);
      navigate("/login");
    }
  }, [checkAuth, navigate]);

  const { data, isLoading, error } = useQuery<Profile>({
    queryKey: ["profile", id],
    queryFn: async () => {
      const response = await request<ProfileApiResponse>({
        url: `/api/profiles/${id}`,
      });
      return response.data.data as Profile;
    },
    enabled: !!id && checkAuth,
  });

  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" />
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container>
        <Card>
          <Card.Body>
            <Card.Text>Profile not found</Card.Text>
            <Button variant="primary" onClick={() => navigate("/profiles")}>
              Back to Profiles
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Button variant="link" onClick={() => navigate(-1)} className="mb-3 p-0">
        &larr; Back to Profiles
      </Button>
      <Card>
        <Card.Header>
          <h3>{data.name}</h3>
        </Card.Header>
        <Card.Body>
          <Row className="g-4">
            <Col md={6}>
              <Card>
                <Card.Body>
                  <Card.Title>Gender</Card.Title>
                  <p className="mb-0">
                    {formatGender(data.gender)} ({formatProbability(data.gender_probability)})
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Body>
                  <Card.Title>Age</Card.Title>
                  <p className="mb-0">
                    {data.age} ({formatAgeGroup(data.age_group)})
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Body>
                  <Card.Title>Country</Card.Title>
                  <p className="mb-0">
                    {data.country_name} ({data.country_id}) - {formatProbability(data.country_probability)}
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Body>
                  <Card.Title>Created</Card.Title>
                  <p className="mb-0">{formatDateTime(data.created_at)}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}