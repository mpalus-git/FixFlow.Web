import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";
import * as prettier from "prettier";
import ts from "typescript";

const contractPath = join(import.meta.dirname, "..", "openapi", "fixflow-api.v1.json");
const schemaPath = join(import.meta.dirname, "..", "src", "shared", "api", "schema.ts");

export function stripComments(source) {
  const sourceFile = ts.createSourceFile(
    "schema.ts",
    source,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  );
  return ts.createPrinter({ removeComments: true }).printFile(sourceFile);
}

export async function generateSchema(contract) {
  const ast = await openapiTS(contract, { exportType: true });
  const config = await prettier.resolveConfig(schemaPath);
  return prettier.format(stripComments(astToString(ast)), { ...config, filepath: schemaPath });
}

async function main() {
  const contract = JSON.parse(await readFile(contractPath, "utf8"));
  await writeFile(schemaPath, await generateSchema(contract));
  console.log(`Generated ${schemaPath}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
