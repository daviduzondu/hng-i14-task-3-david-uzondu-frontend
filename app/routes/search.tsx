import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import {
  Container,
  Card,
  Row,
  Col,
  Table,
  Form,
  InputGroup,
  Button,
  Spinner,
} from "react-bootstrap";
import { request } from "../lib/api";
import type { Profile } from "../types";
import { formatGender, formatAgeGroup, formatProbability, formatDate } from "../lib/utils";

interface SearchApiResponse {
  status: string;
  data: Profile[];
  total?: number;
}

const searchSchema = z.object({
  q: z.string().min(5, "Search query must be at least 5 characters"),
  page: z.number().optional(),
  limit: z.number().optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

export function meta() {
  return [
    { title: "Search - Insighta Labs+" },
    { name: "description", content: "Search Profiles" },
  ];
}

export default function Search() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      q: "",
      page: 1,
      limit: 10,
    },
  });

  const { data, isLoading } = useQuery<SearchApiResponse>({
    queryKey: ["search", searchQuery],
    queryFn: async () => {
      const response = await request<SearchApiResponse>({
        url: `/api/profiles/search?q=${encodeURIComponent(searchQuery)}`,
      });
      return response.data;
    },
    enabled: searchQuery.length >= 5,
  });

  const handleSearch = (formData: SearchFormData) => {
    setSearchQuery(formData.q);
  };

  return (
    <Container>
      <h2 className="mb-4">Search Profiles</h2>
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSubmit(handleSearch)}>
            <Form.Group>
              <InputGroup>
                <Form.Control
                  {...register("q")}
                  placeholder="Search (e.g., young males from Nigeria)"
                  size="lg"
                />
                <Button type="submit" variant="primary">
                  Search
                </Button>
              </InputGroup>
              {errors.q && (
                <Form.Text className="text-danger">
                  {errors.q.message}
                </Form.Text>
              )}
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />
        </div>
      ) : data?.data ? (
        <Card>
          <Card.Body>
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Gender Probability</th>
                  <th>Age</th>
                  <th>Age Group</th>
                  <th>Country</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((profile) => (
                  <tr
                    key={profile.id}
                    onClick={() => navigate(`/profiles/${profile.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{profile.name}</td>
                    <td>{formatGender(profile.gender)}</td>
                    <td>{formatProbability(profile.gender_probability)}</td>
                    <td>{profile.age}</td>
                    <td>{formatAgeGroup(profile.age_group)}</td>
                    <td>{profile.country_name}</td>
                    <td>{formatDate(profile.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Row className="justify-content-between align-items-center">
              <Col md={4}>
                <span className="text-muted">
                  {data.total || 0} results found
                </span>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body className="text-center text-muted">
            Enter a search query (at least 5 characters)
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}