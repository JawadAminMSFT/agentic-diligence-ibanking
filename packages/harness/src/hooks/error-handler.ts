/** Mirrors the SDK's ErrorOccurredHookInput (not re-exported from the package root). */
interface ErrorOccurredHookInput {
  timestamp: number;
  cwd: string;
  error: string;
  errorContext: "model_call" | "tool_execution" | "system" | "user_input";
  recoverable: boolean;
}

/** Mirrors the SDK's ErrorOccurredHookOutput. */
interface ErrorOccurredHookOutput {
  suppressOutput?: boolean;
  errorHandling?: "retry" | "skip" | "abort";
  retryCount?: number;
  userNotification?: string;
}

const MCP_SERVER_CONTEXTS = [
  "web-research",
  "vdr",
  "finance",
  "workflow",
  "memo",
];

export function createErrorHandlerHook() {
  return function onErrorOccurred(
    input: ErrorOccurredHookInput,
    invocation: { sessionId: string }
  ): ErrorOccurredHookOutput {
    const isMcpFailure =
      input.errorContext === "tool_execution" &&
      MCP_SERVER_CONTEXTS.some((s) => input.error.includes(s));

    console.error(
      `[error-handler] Session: ${invocation.sessionId} | Context: ${input.errorContext}`
    );
    console.error(`[error-handler] Error: ${input.error}`);
    console.error(`[error-handler] Recoverable: ${input.recoverable}`);

    if (isMcpFailure) {
      console.error(
        `[error-handler] MCP server failure detected. Suggesting retry.`
      );
      return {
        errorHandling: "retry",
        retryCount: 2,
        userNotification:
          "An MCP server encountered an error. Retrying the operation.",
      };
    }

    if (input.recoverable) {
      return {
        errorHandling: "skip",
        userNotification: `Recoverable error: ${input.error}`,
      };
    }

    return {
      errorHandling: "abort",
      userNotification: `Fatal error: ${input.error}`,
    };
  };
}
