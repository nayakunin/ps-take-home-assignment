import { route, type RouteConfig } from "@react-router/dev/routes";

export default [
  route("/:imageIndex?", "routes/home.tsx"),
] satisfies RouteConfig;
