import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  route("login", "routes/login.tsx"),
  route("auth/github/callback", "routes/auth-callback.tsx"),
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("dashboard", "routes/dashboard.tsx"),
    route("profiles", "routes/profiles.tsx"),
    route("profiles/create", "routes/profiles-create.tsx"),
    route("profiles/:id", "routes/profile-detail.tsx"),
    route("search", "routes/search.tsx"),
    route("account", "routes/account.tsx"),
  ]),
] satisfies RouteConfig;