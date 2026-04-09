import { CopilotClient } from "@github/copilot-sdk";
import { execSync } from "node:child_process";

export type AuthMode = "api-key" | "azure-ad";

export interface HarnessConfig {
  azureEndpoint: string;
  azureDeployment: string;
  model?: string;
  logLevel?: string;
  authMode: AuthMode;
  apiKey?: string;
  bearerToken?: string;
}

function getAzureAdToken(): string {
  // AI Foundry endpoints require the https://ai.azure.com audience
  const resource = process.env.AZURE_TOKEN_RESOURCE ?? "https://ai.azure.com";
  try {
    const token = execSync(
      `az account get-access-token --resource "${resource}" --query "accessToken" -o tsv`,
      { encoding: "utf-8", timeout: 15000 }
    ).trim();
    if (!token) throw new Error("Empty token returned");
    return token;
  } catch (err) {
    throw new Error(
      `Failed to get Azure AD token via 'az account get-access-token'. ` +
        `Ensure you are logged in with 'az login'. Error: ${err}`
    );
  }
}

export function loadConfigFromEnv(): HarnessConfig {
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT ?? "gpt-5.4-mini";
  const authMode: AuthMode = process.env.AZURE_AUTH_MODE === "api-key" ? "api-key" : "azure-ad";

  if (!azureEndpoint) {
    throw new Error("Missing required env var: AZURE_OPENAI_ENDPOINT");
  }

  let apiKey: string | undefined;
  let bearerToken: string | undefined;

  if (authMode === "api-key") {
    apiKey = process.env.AZURE_OPENAI_API_KEY ?? "";
    if (!apiKey) {
      throw new Error("Missing required env var: AZURE_OPENAI_API_KEY (authMode=api-key)");
    }
  } else {
    console.log("🔑 Fetching Azure AD token via 'az account get-access-token'...");
    bearerToken = getAzureAdToken();
    console.log("✅ Azure AD token acquired.");
  }

  return {
    azureEndpoint,
    azureDeployment,
    model: process.env.AZURE_OPENAI_MODEL ?? azureDeployment,
    logLevel: process.env.LOG_LEVEL,
    authMode,
    apiKey,
    bearerToken,
  };
}

export async function createCopilotClient(): Promise<CopilotClient> {
  const client = new CopilotClient();
  await client.start();
  return client;
}
