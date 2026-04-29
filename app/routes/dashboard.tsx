import { useQuery } from "@tanstack/react-query";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { request } from "../lib/api";
import type { Profile } from "../types";

interface DashboardStats {
  total: number;
  male: number;
  female: number;
}

interface ProfileApiResponse {
  status: string;
  data: Profile[];
  total?: number;
}

export function meta() {
  return [
    { title: "Dashboard - Insighta Labs+" },
    { name: "description", content: "Dashboard" },
  ];
}

export default function Dashboard() {

  const { data: statsData, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [maleRes, femaleRes] = await Promise.all([
        request<ProfileApiResponse>({
          url: "/api/profiles",
          params: { limit: 1, gender: "male" },
        }),
        request<ProfileApiResponse>({
          url: "/api/profiles",
          params: { limit: 1, gender: "female" },
        }),
      ]);

      const totalRes = await request<ProfileApiResponse>({
        url: "/api/profiles",
        params: { limit: 1 },
      });

      return {
        total: totalRes.data?.total || 0,
        male: maleRes.data?.total || 0,
        female: femaleRes.data?.total || 0,
      };
    },
  });

  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" />
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">Dashboard</h2>
      <Row className="g-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <Card.Title>Total Profiles</Card.Title>
              <h3>{statsData?.total || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <Card.Title>Male Profiles</Card.Title>
              <h3>{statsData?.male || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <Card.Title>Female Profiles</Card.Title>
              <h3>{statsData?.female || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="g-4 mt-3">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Quick Actions</Card.Title>
              <div className="d-flex gap-2 mt-3">
                <a href="/profiles" className="btn btn-primary">
                  View All Profiles
                </a>
                <a href="/search" className="btn btn-outline-primary">
                  Search Profiles
                </a>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}