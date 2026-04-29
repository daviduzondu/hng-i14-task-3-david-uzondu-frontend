import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { request } from "../lib/api";

const createProfileSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .regex(/^[a-zA-Z\s]+$/, { message: "Name must only contain letters" }),
});

type CreateProfileFormData = z.infer<typeof createProfileSchema>;

export function meta() {
  return [
    { title: "Create Profile - Insighta Labs+" },
    { name: "description", content: "Create a new profile" },
  ];
}

export default function CreateProfile() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
    setSuccess(null);

    try {
      const response = await request<{ status: string; message: string }>({
        method: "post",
        url: "/api/profiles",
        data: data,
      });

      if (response.data.status === "success") {
        setSuccess(response.data.message || "Profile created successfully");
        setTimeout(() => {
          navigate("/profiles");
        }, 1500);
      } else {
        setError(response.data.message || "Failed to create profile");
      }
    } catch (err) {
      setError("Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {success && <Alert variant="success">{success}</Alert>}
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