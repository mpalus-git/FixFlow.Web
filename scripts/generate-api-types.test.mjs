import { describe, expect, it } from "vitest";
import { generateSchema, stripComments } from "./generate-api-types.mjs";

describe("stripComments", () => {
  it("removes doc, block and line comments", () => {
    const source = "/** Doc */\nexport type A = {\n  /* block */\n  a: string; // line\n};\n";

    expect(stripComments(source)).toBe("export type A = {\n    a: string;\n};\n");
  });

  it("keeps comment markers inside string literal types", () => {
    const source = 'export type Url = "https://example.com/*";\n';

    expect(stripComments(source)).toContain('"https://example.com/*"');
  });
});

describe("generateSchema", () => {
  it("generates exported types without comments from a contract", async () => {
    const contract = {
      openapi: "3.1.1",
      info: { title: "Test", version: "1" },
      paths: {
        "/items": {
          get: {
            summary: "List items",
            description: "Returns all items",
            responses: { 200: { description: "OK" } },
          },
        },
      },
    };

    const schema = await generateSchema(contract);

    expect(schema).toContain("export type paths = {");
    expect(schema).not.toMatch(/\/\*|\/\//);
  });
});
