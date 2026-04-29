import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Container, Card, Form, Button, Alert, Spinner, Row, Col } from "react-bootstrap";
import { request } from "../lib/api";
import type { Profile } from "../types";
import { formatGender, formatAgeGroup, formatProbability, formatDate } from "../lib/utils";

const createProfileSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .regex(/^[a-zA-Z\s]+$/, { message: "Name must only contain letters" }),
});

type CreateProfileFormData = z.infer<typeof createProfileSchema>;

interface CreateProfileResponse {
  status: "success" | "error";
  message?: string;
  data?: Profile;
}

export function meta() {
  return [
    { title: "Create Profile - Insighta Labs+" },
    { name: "description", content: "Create a new profile" },
  ];
}

export default function CreateProfile() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createdProfile, setCreatedProfile] = useState<Profile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProfileFormData>({
    resolver: zodResolver(createProfileSchema),
  });

  const onSubmit = async (data: CreateProfileFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    setCreatedProfile(null);

    try {
      const response = await request<CreateProfileResponse>({
        method: "post",
        url: "/api/profiles",
        data: data,
      });

      if (response.data.status === "success" && response.data.data) {
        setSuccessMessage(response.data.message || "Profile created successfully");
        setCreatedProfile(response.data.data);
      } else {
        setError(response.data.message || "Failed to create profile");
      }
    } catch (err) {
      setError("Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdProfile) {
    return (
      <Container style={{ maxWidth: "700px" }}>
        <Button variant="link" onClick={() => navigate("/profiles")} className="mb-3 p-0">
          &larr; Back to Profiles
        </Button>
        <Card>
          <Card.Header>
            <h3>Profile Created Successfully</h3>
          </Card.Header>
          <Card.Body>
            <Alert variant="success">{successMessage}</Alert>
            <Row className="g-3">
              <Col md={6}>
                <Card>
                  <Card.Body>
                    <Card.Title>Name</Card.Title>
                    <p className="mb-0">{createdProfile.name}</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card>
                  <Card.Body>
                    <Card.Title>Gender</Card.Title>
                    <p className="mb-0">
                      {formatGender(createdProfile.gender)} ({formatProbability(createdProfile.gender_probability)})
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card>
                  <Card.Body>
                    <Card.Title>Age</Card.Title>
                    <p className="mb-0">
                      {createdProfile.age} ({formatAgeGroup(createdProfile.age_group)})
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card>
                  <Card.Body>
                    <Card.Title>Country</Card.Title>
                    <p className="mb-0">
                      {createdProfile.country_name} ({createdProfile.country_id}) - {formatProbability(createdProfile.country_probability)}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={12}>
                <Card>
                  <Card.Body>
                    <Card.Title>Created</Card.Title>
                    <p className="mb-0">{formatDate(createdProfile.created_at)}</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            <div className="mt-4 d-flex gap-2">
              <Button variant="primary" onClick={() => navigate("/profiles")}>
                Back to Profiles
              </Button>
              <Button variant="outline-secondary" onClick={() => {
                setCreatedProfile(null);
                setSuccessMessage(null);
              }}>
                Create Another
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container style={{ maxWidth: "600px" }}>
      <Button variant="link" onClick={() => navigate("/profiles")} className="mb-3 p-0">
        &larr; Back to Profiles
      </Button>
      <Card>
        <Card.Header>
          <h3>Create Profile</h3>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                {...register("name")}
                type="text"
                placeholder="Enter name (letters only)"
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name?.message}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Enter a name containing only letters (a-z, A-Z)
              </Form.Text>
            </Form.Group>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Creating...
                </>
              ) : (
                "Create Profile"
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}