import { useState } from "react";
import { useSearchParams } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Pagination,
  Spinner,
  Button,
} from "react-bootstrap";
import { request } from "../lib/api";
import type { Profile, Gender, AgeGroupType } from "../types";
import { formatGender, formatAgeGroup, formatProbability, formatDate } from "../lib/utils";
import { isAuthenticated } from "../lib/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router";

interface ProfilesApiResponse {
  status: string;
  data: Profile[];
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
}

const filtersSchema = z
  .object({
    gender: z.enum(["male", "female"]).optional().nullable(),
    country_id: z.string().optional().nullable(),
    age_group: z.enum(["child", "teenager", "adult", "senior"]).optional().nullable(),
    min_age: z.number().optional().nullable(),
    max_age: z.number().optional().nullable(),
    min_gender_probability: z.number().optional().nullable(),
    min_country_probability: z.number().optional().nullable(),
    sort_by: z.enum(["age", "created_at", "gender_probability"]).optional().nullable(),
    order: z.enum(["asc", "desc"]).optional().nullable(),
    page: z.number().optional().nullable(),
    limit: z.number().optional().nullable(),
  })
  .refine(
    (data) => {
      const minAge = data.min_age ?? undefined;
      const maxAge = data.max_age ?? undefined;
      if (minAge !== undefined && maxAge !== undefined) {
        return maxAge >= minAge;
      }
      return true;
    },
    { message: "max_age cannot be lower than min_age" }
  );

type FiltersFormData = z.infer<typeof filtersSchema>;

export function meta() {
  return [
    { title: "Profiles - Insighta Labs+" },
    { name: "description", content: "Profiles List" },
  ];
}

export default function Profiles() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const getNumberParam = (key: string) => {
    const val = searchParams.get(key);
    return val ? parseInt(val) : undefined;
  };

  const [filters, setFilters] = useState<FiltersFormData>({
    gender: searchParams.get("gender") === "null" ? undefined : (searchParams.get("gender") as Gender | undefined) ?? undefined,
    country_id: searchParams.get("country_id") || undefined,
    age_group: searchParams.get("age_group") === "null" ? undefined : (searchParams.get("age_group") as AgeGroupType | undefined) ?? undefined,
    min_age: getNumberParam("min_age"),
    max_age: getNumberParam("max_age"),
    min_gender_probability: getNumberParam("min_gender_probability"),
    min_country_probability: getNumberParam("min_country_probability"),
    sort_by: (searchParams.get("sort_by") as "age" | "created_at" | "gender_probability") || undefined,
    order: (searchParams.get("order") as "asc" | "desc") || undefined,
    page: getNumberParam("page") || 1,
    limit: getNumberParam("limit") || 10,
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FiltersFormData>({
    resolver: zodResolver(filtersSchema),
    defaultValues: filters,
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      sessionStorage.setItem("redirect_after_login", window.location.pathname + window.location.search);
      navigate("/login");
    }
  }, [navigate]);

  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.set(key, String(value));
    }
  });

  const { data, isLoading } = useQuery<ProfilesApiResponse>({
    queryKey: ["profiles", filters],
    queryFn: async () => {
      const response = await request<ProfilesApiResponse>({
        url: `/api/profiles?${queryParams.toString()}`,
      });
      return response.data;
    },
  });

  const handleFilterSubmit = (formData: FiltersFormData) => {
    const cleanedData: FiltersFormData = { ...formData, page: 1 };
    
    // Convert empty strings to undefined
    Object.keys(cleanedData).forEach((key) => {
      const k = key as keyof FiltersFormData;
      if (cleanedData[k] === "" || cleanedData[k] === null) {
        cleanedData[k] = undefined;
      }
    });
    
    const params = new URLSearchParams();
    Object.entries(cleanedData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });
    params.set("page", "1");
    setSearchParams(params);
    setFilters(cleanedData);
    reset(cleanedData);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
    setFilters({ ...filters, page: newPage });
  };

  const handleLimitChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("limit", String(newLimit));
    params.set("page", "1");
    setSearchParams(params);
    setFilters({ ...filters, limit: newLimit, page: 1 });
    reset({ ...filters, limit: newLimit, page: 1 });
  };

  const totalPages = data?.total_pages || 1;
  const currentPage = filters.page || 1;
  const currentLimit = filters.limit || 10;

  return (
    <Container>
      <h2 className="mb-4">Profiles</h2>
      <Row className="g-4 mb-4">
        <Col md={12}>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit(handleFilterSubmit)}>
                <Row className="g-3 align-items-end">
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Gender</Form.Label>
                      <Controller
                        name="gender"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Form.Select
                            onChange={e => onChange(e.target.value || undefined)}
                            value={value ?? ""}
                          >
                            <option value="">All</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </Form.Select>
                        )}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Age Group</Form.Label>
                      <Controller
                        name="age_group"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Form.Select
                            onChange={e => onChange(e.target.value || undefined)}
                            value={value ?? ""}
                          >
                            <option value="">All</option>
                            <option value="child">Child</option>
                            <option value="teenager">Teenager</option>
                            <option value="adult">Adult</option>
                            <option value="senior">Senior</option>
                          </Form.Select>
                        )}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Min Age</Form.Label>
                      <Controller
                        name="min_age"
                        control={control}
                        render={({ field }) => (
                          <Form.Control
                            type="number"
                            {...field}
                            value={field.value ?? ""}
                            onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        )}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Max Age</Form.Label>
                      <Controller
                        name="max_age"
                        control={control}
                        render={({ field }) => (
                          <Form.Control
                            type="number"
                            {...field}
                            value={field.value ?? ""}
                            onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        )}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Sort By</Form.Label>
                      <Controller
                        name="sort_by"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Form.Select
                            onChange={e => onChange(e.target.value || undefined)}
                            value={value ?? "created_at"}
                          >
                            <option value="created_at">Created</option>
                            <option value="age">Age</option>
                            <option value="gender_probability">Gender Probability</option>
                          </Form.Select>
                        )}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Order</Form.Label>
                      <Controller
                        name="order"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Form.Select
                            onChange={e => onChange(e.target.value || undefined)}
                            value={value ?? "asc"}
                          >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                          </Form.Select>
                        )}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Min Gender Prob</Form.Label>
                      <Controller
                        name="min_gender_probability"
                        control={control}
                        render={({ field }) => (
                          <Form.Control
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            {...field}
                            value={field.value ?? ""}
                            onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        )}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Min Country Prob</Form.Label>
                      <Controller
                        name="min_country_probability"
                        control={control}
                        render={({ field }) => (
                          <Form.Control
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            {...field}
                            value={field.value ?? ""}
                            onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        )}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Country</Form.Label>
                      <Controller
                        name="country_id"
                        control={control}
                        render={({ field }) => (
                          <Form.Control
                            {...field}
                            value={field.value ?? ""}
                            placeholder="e.g., NG, US"
                          />
                        )}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-flex align-items-end">
                    <Form.Group>
                      <Form.Label>&nbsp;</Form.Label>
                      <div className="d-flex gap-2">
                        <Button type="submit" variant="primary">
                          Apply Filters
                        </Button>
                        <Button
                          type="button"
                          variant="outline-secondary"
                          onClick={() => {
                            const defaultFilters = {
                              gender: undefined,
                              country_id: undefined,
                              age_group: undefined,
                              min_age: undefined,
                              max_age: undefined,
                              min_gender_probability: undefined,
                              min_country_probability: undefined,
                              sort_by: "created_at" as const,
                              order: "asc" as const,
                              page: 1,
                              limit: 10,
                            };
                            reset(defaultFilters);
                            setFilters(defaultFilters);
                            setSearchParams(new URLSearchParams());
                          }}
                        >
                          Reset
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Card>
        <Card.Body>
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" />
            </div>
          ) : (
            <>
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
                  {data?.data?.map((profile) => (
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
                    Showing {(currentPage - 1) * currentLimit + 1} to{" "}
                    {Math.min(
                      currentPage * currentLimit,
                      data?.total || 0
                    )}{" "}
                    of {data?.total || 0} profiles
                  </span>
                </Col>
                <Col md={8} className="d-flex justify-content-end align-items-center">
                  <Form.Group className="me-3 d-flex align-items-center">
                    <Form.Label className="me-2 mb-0">Per Page:</Form.Label>
                    <Form.Select
                      value={currentLimit}
                      onChange={e => handleLimitChange(parseInt(e.target.value))}
                      style={{ width: "80px" }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </Form.Select>
                  </Form.Group>
                  <Pagination className="mb-0">
                    <Pagination.Prev
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    />
                    {totalPages <= 7 ? (
                      Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Pagination.Item
                          key={page}
                          active={page === currentPage}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Pagination.Item>
                      ))
                    ) : (
                      <>
                        {currentPage <= 3 ? (
                          <>
                            {[1, 2, 3, 4, 5].map(page => (
                              <Pagination.Item
                                key={page}
                                active={page === currentPage}
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </Pagination.Item>
                            ))}
                            <Pagination.Ellipsis disabled />
                            <Pagination.Item onClick={() => handlePageChange(totalPages)}>
                              {totalPages}
                            </Pagination.Item>
                          </>
                        ) : currentPage >= totalPages - 2 ? (
                          <>
                            <Pagination.Item onClick={() => handlePageChange(1)}>
                              1
                            </Pagination.Item>
                            <Pagination.Ellipsis disabled />
                            {[totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages].map(page => (
                              <Pagination.Item
                                key={page}
                                active={page === currentPage}
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </Pagination.Item>
                            ))}
                          </>
                        ) : (
                          <>
                            <Pagination.Item onClick={() => handlePageChange(1)}>
                              1
                            </Pagination.Item>
                            <Pagination.Ellipsis disabled />
                            {[currentPage - 1, currentPage, currentPage + 1].map(page => (
                              <Pagination.Item
                                key={page}
                                active={page === currentPage}
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </Pagination.Item>
                            ))}
                            <Pagination.Ellipsis disabled />
                            <Pagination.Item onClick={() => handlePageChange(totalPages)}>
                              {totalPages}
                            </Pagination.Item>
                          </>
                        )}
                      </>
                    )}
                    <Pagination.Next
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    />
                  </Pagination>
                </Col>
              </Row>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}