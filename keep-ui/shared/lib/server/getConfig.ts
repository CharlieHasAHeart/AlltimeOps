import { InternalConfig } from "@/types/internal-config";
import { getApiURL } from "@/utils/apiUrl";
import {
  AuthType,
  MULTI_TENANT,
  NO_AUTH,
  SINGLE_TENANT,
} from "@/utils/authenticationType";

export function getConfig(): InternalConfig {
  const productMode = process.env.NEXT_PUBLIC_PRODUCT_MODE || "platform";
  const slimMode =
    process.env.NEXT_PUBLIC_SLIM_MODE === "true" || productMode === "lite";

  const defaultEnabledPages = [
    "overview",
    "servers",
    "incidents",
    "signals",
    "playbooks",
    "actions",
    "integrations",
    "settings",
    "ai_settings",
  ];
  const enabledPages = process.env.NEXT_PUBLIC_ENABLED_PAGES
    ? process.env.NEXT_PUBLIC_ENABLED_PAGES.split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    : defaultEnabledPages;

  const defaultEnabledProviders = [
    "prometheus",
    "webhook",
    "qwen",
    "ollama",
    "smtp",
    "github",
    "jira",
    "ssh",
    "deepseek",
  ];
  const enabledProviders = process.env.NEXT_PUBLIC_ENABLED_PROVIDERS
    ? process.env.NEXT_PUBLIC_ENABLED_PROVIDERS.split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    : defaultEnabledProviders;

  const defaultEnabledWorkflowTemplates = [
    "mvp_prometheus_ai_smtp.yml",
    "mvp_webhook_ai_github.yml",
    "mvp_prometheus_ssh_incident_comment.yml",
    "mvp_workflow_test_runner.yml",
  ];
  const enabledWorkflowTemplates = process.env.NEXT_PUBLIC_ENABLED_WORKFLOW_TEMPLATES
    ? process.env.NEXT_PUBLIC_ENABLED_WORKFLOW_TEMPLATES.split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : defaultEnabledWorkflowTemplates;

  let authType = process.env.AUTH_TYPE;
  // Backward compatibility
  if (authType === MULTI_TENANT) {
    authType = AuthType.AUTH0;
  } else if (authType === SINGLE_TENANT) {
    authType = AuthType.DB;
  } else if (authType === NO_AUTH) {
    authType = AuthType.NOAUTH;
  } else if (Object.values(AuthType).includes(authType as AuthType)) {
    // Keep the auth type if it's a valid enum value
    authType = authType as AuthType;
  } else {
    // Default to NOAUTH
    authType = AuthType.NOAUTH;
  }

  // we want to support preview branches on vercel
  let API_URL_CLIENT;
  // if we are on vercel, default to getApiURL() if no API_URL_CLIENT is set
  if (process.env.VERCEL_GIT_COMMIT_REF) {
    API_URL_CLIENT = process.env.API_URL_CLIENT || getApiURL();
    // else, no default since we will use relative URLs
  } else {
    API_URL_CLIENT = process.env.API_URL_CLIENT;
  }

  // Parse alert sidebar fields from environment variable
  // Default includes all standard fields
  const defaultAlertSidebarFields = [
    "service",
    "source",
    "description",
    "message",
    "fingerprint",
    "url",
    "incidents",
    "timeline",
    "relatedServices",
  ];
  const alertSidebarFields = process.env.ALERT_SIDEBAR_FIELDS
    ? process.env.ALERT_SIDEBAR_FIELDS.split(",").map((field) => field.trim())
    : defaultAlertSidebarFields;
  const defaultMvpPages = [
    "incidents",
    "feed_alerts",
    "deduplication",
    "correlations",
    "workflows",
    "ai_plugins",
    "providers",
  ];
  const kasMvpPages = process.env.KAS_MVP_PAGES
    ? process.env.KAS_MVP_PAGES.split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    : defaultMvpPages;

  return {
    PRODUCT_MODE: productMode,
    SLIM_MODE: slimMode,
    ENABLED_PAGES: enabledPages,
    ENABLED_PROVIDERS: enabledProviders,
    ENABLED_WORKFLOW_TEMPLATES: enabledWorkflowTemplates,
    AUTH_TYPE: authType,
    PUSHER_DISABLED: process.env.PUSHER_DISABLED === "true",
    // could be relative (for ingress) or absolute (e.g. Pusher)
    PUSHER_HOST: process.env.PUSHER_HOST,
    PUSHER_PORT: process.env.PUSHER_HOST
      ? parseInt(process.env.PUSHER_PORT!)
      : undefined,
    PUSHER_APP_KEY: process.env.PUSHER_APP_KEY,
    PUSHER_CLUSTER: process.env.PUSHER_CLUSTER,
    // The API URL is used by the server to make requests to the API
    //   note that we need two different URLs for the client and the server
    //   because in some environments, e.g. docker-compose, the server can get keep-backend
    //   whereas the client (browser) can get only localhost
    API_URL: process.env.API_URL,
    // could be relative (e.g. for ingress) or absolute (e.g. for cloud run)
    API_URL_CLIENT: API_URL_CLIENT,
    POSTHOG_KEY: process.env.POSTHOG_KEY,
    POSTHOG_DISABLED: process.env.POSTHOG_DISABLED,
    POSTHOG_HOST: process.env.POSTHOG_HOST,
    SENTRY_DISABLED: process.env.SENTRY_DISABLED,
    READ_ONLY: process.env.KEEP_READ_ONLY === "true",
    OPEN_AI_API_KEY_SET:
      !!process.env.OPEN_AI_API_KEY || !!process.env.OPENAI_API_KEY,
    // NOISY ALERTS DISABLED BY DEFAULT TO SPARE SPACE ON THE TABLE
    NOISY_ALERTS_ENABLED: process.env.NOISY_ALERTS_ENABLED === "true",
    // The URL of the documentation site
    KEEP_DOCS_URL: process.env.KEEP_DOCS_URL || "https://docs.keephq.dev",
    KEEP_CONTACT_US_URL:
      process.env.KEEP_CONTACT_US_URL || "https://slack.keephq.dev/",
    KEEP_HIDE_SENSITIVE_FIELDS:
      process.env.KEEP_HIDE_SENSITIVE_FIELDS === "true",
    KEEP_WORKFLOW_DEBUG: process.env.KEEP_WORKFLOW_DEBUG === "true",
    HIDE_NAVBAR_DEDUPLICATION:
      process.env.HIDE_NAVBAR_DEDUPLICATION?.toLowerCase() === "true",
    HIDE_NAVBAR_WORKFLOWS:
      process.env.HIDE_NAVBAR_WORKFLOWS?.toLowerCase() === "true",
    HIDE_NAVBAR_SERVICE_TOPOLOGY:
      process.env.HIDE_NAVBAR_SERVICE_TOPOLOGY?.toLowerCase() === "true",
    HIDE_NAVBAR_MAPPING:
      process.env.HIDE_NAVBAR_MAPPING?.toLowerCase() === "true",
    HIDE_NAVBAR_EXTRACTION:
      process.env.HIDE_NAVBAR_EXTRACTION?.toLowerCase() === "true",
    HIDE_NAVBAR_MAINTENANCE_WINDOW:
      process.env.HIDE_NAVBAR_MAINTENANCE_WINDOW?.toLowerCase() === "true",
    HIDE_NAVBAR_AI_PLUGINS:
      process.env.HIDE_NAVBAR_AI_PLUGINS?.toLowerCase() === "true",
    KAS_MVP_PAGES: kasMvpPages,
    // Ticketing integration
    KEEP_TICKETING_ENABLED:
      process.env.KEEP_TICKETING_ENABLED?.toLowerCase() === "true",
    KEEP_WF_LIST_EXTENDED_INFO:
      process.env.KEEP_WF_LIST_EXTENDED_INFO?.toLowerCase() === "true",
    // Alert sidebar fields configuration
    ALERT_SIDEBAR_FIELDS: alertSidebarFields,
  };
}
