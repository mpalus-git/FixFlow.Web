export type ApiErrorKind =
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "notFound"
  | "conflict"
  | "preconditionFailed"
  | "preconditionRequired"
  | "rateLimited"
  | "server"
  | "network"
  | "unexpected";

export type FieldErrors = Readonly<Record<string, readonly string[]>>;

type ApiErrorInit = {
  kind: ApiErrorKind;
  status?: number;
  errorCode?: string;
  detail?: string;
  fieldErrors?: FieldErrors;
  retryAfterSeconds?: number;
  cause?: unknown;
};

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;
  readonly errorCode: string | null;
  readonly detail: string | null;
  readonly fieldErrors: FieldErrors;
  readonly retryAfterSeconds: number | null;

  constructor(init: ApiErrorInit) {
    super(init.detail ?? `API request failed: ${init.kind}`, { cause: init.cause });
    this.name = "ApiError";
    this.kind = init.kind;
    this.status = init.status ?? null;
    this.errorCode = init.errorCode ?? null;
    this.detail = init.detail ?? null;
    this.fieldErrors = init.fieldErrors ?? {};
    this.retryAfterSeconds = init.retryAfterSeconds ?? null;
  }
}

const kindsByStatus: Readonly<Record<number, ApiErrorKind>> = {
  400: "validation",
  401: "unauthorized",
  403: "forbidden",
  404: "notFound",
  409: "conflict",
  412: "preconditionFailed",
  428: "preconditionRequired",
  429: "rateLimited",
};

function kindFromStatus(status: number): ApiErrorKind {
  return kindsByStatus[status] ?? (status >= 500 ? "server" : "unexpected");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" && value !== "" ? value : undefined;
}

function readFieldErrors(value: unknown): FieldErrors {
  if (!isRecord(value)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value).flatMap(([field, messages]) =>
      Array.isArray(messages)
        ? [[field, messages.filter((message): message is string => typeof message === "string")]]
        : [],
    ),
  );
}

function parseRetryAfter(header: string | null): number | undefined {
  return header !== null && /^\d+$/.test(header) ? Number(header) : undefined;
}

export function toApiError(response: Response, body: unknown): ApiError {
  const problem = isRecord(body) ? body : {};
  const detail = readString(problem, "detail") ?? readString(problem, "title");
  const errorCode = readString(problem, "errorCode");
  const retryAfterSeconds = parseRetryAfter(response.headers.get("Retry-After"));

  return new ApiError({
    kind: kindFromStatus(response.status),
    status: response.status,
    fieldErrors: readFieldErrors(problem.errors),
    ...(detail === undefined ? {} : { detail }),
    ...(errorCode === undefined ? {} : { errorCode }),
    ...(retryAfterSeconds === undefined ? {} : { retryAfterSeconds }),
  });
}
