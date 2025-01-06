import { Eko } from "@eko-ai/eko";
import { EkoConfig } from "@eko-ai/eko/types";
import { getLLMConfig } from "@eko-ai/eko/extension";

export async function main() {
  // Load LLM model configuration
  // the current browser plugin project provides a page for configuring LLM parameters
  let config = await getLLMConfig();

  // Initialize eko
  let eko = new Eko(config as EkoConfig);

  // Generate a workflow from natural language description
  const workflow = await eko.generateWorkflow(`
    Search Sam Altman's information and summarize it into markdown format for export
  `);

  // Execute the workflow
  await eko.execute(workflow);
}