import { Eko } from "@eko-ai/eko";
import { loadTools } from "@eko-ai/eko/nodejs";
import { WorkflowParser } from "@eko-ai/eko";
import dotenv from "dotenv";
import fs from "fs/promises";

dotenv.config();

Eko.tools = loadTools();

import { Tool, InputSchema } from "@eko-ai/eko/types";

class DirectoryFormatter implements Tool {
  name = "format_directory";
  description =
    "Format directory listing with size and date information. Notice that this tool is not responsible for gathering the directory entries; instead, it only formats the provided entries.";

  input_schema: InputSchema = {
    type: "object",
    properties: {
      entries: {
        type: "array",
        description: "Array of directory entries",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name of the file or directory",
            },
            size: {
              type: "integer",
              description: "Size of the file in bytes",
            },
            modifiedAt: {
              type: "string",
              description:
                "Last modification date in ISO 8601 format (e.g., '2024-01-08T15:30:00Z')",
            },
          },
          required: ["name", "size", "modifiedAt"],
        },
      },
      format: {
        type: "string",
        enum: ["simple", "detailed"],
        description:
          "Output format style - 'simple' shows only names, 'detailed' includes size and modification date",
        default: "simple",
      },
    },
    required: ["entries"],
  };

  async execute(context, params) {
    const { entries, format = "simple" } = params as any;

    if (format === "simple") {
      return entries.map((entry) => entry.name).join("\n");
    }

    return entries
      .map(
        (entry) => `${entry.name} - ${entry.size} bytes - ${entry.modifiedAt}`
      )
      .join("\n");
  }
}

async function main() {
  // Initialize Eko with specific LLM configuration
  const eko = new Eko({
    llm: "claude", // Explicitly choose Claude as our LLM
    apiKey: process.env.ANTHROPIC_API_KEY,
    modelName: "claude-3-5-sonnet-20241022", // Use Sonnet for balanced performance
    maxTokens: 4096, // Adjust token limit if needed
  });
  eko.registerTool(new DirectoryFormatter());

  // Generate a workflow from natural language description
  const workflow = await eko.generate(
    "List the directory contents in detailed format, including file sizes. Save the result to a file called contents.txt."
  );

  // Save the generated workflow for inspection
  const workflowJson = WorkflowParser.serialize(workflow);
  await fs.writeFile("workflow.json", workflowJson);
  console.log("Generated workflow saved to workflow.json");

  // Execute with monitoring hooks
  const result = await eko.execute(workflow, {
    hooks: {
      // Monitor subtask progress
      beforeSubtask: async (subtask, context) => {
        console.log(`Starting subtask: ${subtask.name}`);
        console.log(
          `Available tools:`,
          subtask.action.tools.map((t) => t.name)
        );
        return true; // Return false to skip this subtask
      },
      // Monitor individual tool usage
      beforeToolUse: async (tool, context, input) => {
        console.log(`Using tool ${tool.name} with input:`, input);
        return input; // Can modify input before tool executes
      },
      afterSubtask: async (subtask, context, result) => {
        console.log(`Completed ${subtask.name} with result:`, result);
      },
    },
  });

  console.log("Workflow completed:", result);
}

main().catch(console.error);
