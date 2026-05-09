import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  async function initializeCopilotRuntime() {
    try {
      const [{ CopilotRuntime, OpenAIAdapter, copilotRuntimeNextJSAppRouterEndpoint }, { default: OpenAI, OpenAIError }] =
        await Promise.all([import("@copilotkit/runtime"), import("openai")]);

      const apiKey = process.env.OPEN_AI_API_KEY;
      if (!apiKey) {
        return null;
      }

      const openai = new OpenAI({
        organization: process.env.OPEN_AI_ORGANIZATION_ID,
        apiKey,
      });
      const serviceAdapter = new OpenAIAdapter({
        openai,
        ...(process.env.OPENAI_MODEL_NAME
          ? { model: process.env.OPENAI_MODEL_NAME }
          : {}),
      });
      const runtime = new CopilotRuntime();
      return { runtime, serviceAdapter, copilotRuntimeNextJSAppRouterEndpoint };
    } catch (error) {
      if (error instanceof Error && error.name === "OpenAIError") {
        console.log("Error connecting to OpenAI", error);
      } else {
        console.error("Error initializing Copilot Runtime", error);
      }
      return null;
    }
  }

  const runtimeOptions = await initializeCopilotRuntime();

  if (!runtimeOptions) {
    return new Response("Error initializing Copilot Runtime", { status: 500 });
  }
  const { runtime, serviceAdapter, copilotRuntimeNextJSAppRouterEndpoint } =
    runtimeOptions;
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
