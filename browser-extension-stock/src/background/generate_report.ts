import {
  Tool,
  InputSchema,
  ExecutionContext,
  LLMStreamHandler,
  Message,
  LLMParameters,
} from "@eko-ai/eko/types";
import { utils } from "@eko-ai/eko/extension";

export interface GenerateReportParams {
  title: string;
  content: string;
}

export class GenerateReport implements Tool<GenerateReportParams, any> {
  name: string;
  description: string;
  input_schema: InputSchema;

  constructor() {
    this.name = "generate_report";
    this.description =
      "Generate visualization report pages, such as data analysis reports, stock analysis reports, etc.";
    this.input_schema = {
      type: "object",
      properties: {
        content: {
          type: "string",
          description:
            "Text-based report descriptions and specific data & content",
        },
      },
      required: ["content"],
    };
  }

  async execute(
    context: ExecutionContext,
    params: GenerateReportParams
  ): Promise<any> {
    let tabId = (
      await chrome.tabs.create({
        url: "http://www.veasion.cn/artifacts/",
      })
    ).id as number;
    await this.generateReport(context, params, tabId);
    return { success: true };
  }

  async generateReport(
    context: ExecutionContext,
    params: GenerateReportParams,
    tabId: number
  ) {
    let assistantTextMessage = "";
    const handler: LLMStreamHandler = {
      onStart: () => {
        this.changeCode(tabId, "<span>Generating analysis report...</span>");
      },
      onContent: (content) => {
        if (content.trim()) {
          assistantTextMessage += content;
          this.changeCode(tabId, `<pre>${assistantTextMessage}</pre>`);
        }
      },
      onToolUse: async (toolCall) => {
        console.log("Tool Call:", toolCall.name, toolCall.input);
        utils.waitForTabComplete(tabId, 30000).then(() => {
          this.changeCode(
            tabId,
            toolCall.input.react_component_code as string,
            toolCall.input.title as string
          );
        });
      },
      onComplete: (llmResponse) => {
        console.log("Stream Completed:", llmResponse);
      },
      onError: (error) => {
        console.error("Stream Error:", error);
        this.changeCode(tabId, `<span>Error: ${error.message}</span>`);
      },
    };
    const messages: Message[] = [
      { role: "system", content: this.getSystemPrompt() },
      {
        role: "user",
        content: `<user_query>${params.title}</user_query>\n<user_contents>${params.content}</user_contents>`,
      },
    ];
    const llmParams: LLMParameters = {
      maxTokens: 8192,
      tools: [
        {
          name: "generate_react_antArtifact",
          description: "Generate antArtifact, React component",
          input_schema: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "antArtifact title",
              },
              react_component_code: {
                type: "string",
                description: "React component code",
              },
            },
            required: ["title", "react_component_code", "modify_suggestions"],
          },
        },
      ],
      toolChoice: { type: "tool", name: "generate_react_antArtifact" },
    };
    await context.llmProvider.generateStream(messages, llmParams, handler);
  }

  async changeCode(tabId: number, reactCode: string, pageTitle?: string) {
    try {
      await utils.executeScript(
        tabId,
        function (code: any, title: string) {
          window.postMessage({ type: "changeReactCode", code, title }, "*");
        },
        [reactCode, pageTitle]
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  getSystemPrompt() {
    return `<artifacts_info>
The assistant can create and reference artifacts during conversations. Artifacts are for substantial, self-contained content that users might modify or reuse, displayed in a separate UI window for clarity.

# Good artifacts are...
- Substantial content (>15 lines)
- Content that the user is likely to modify, iterate on, or take ownership of
- Self-contained, complex content that can be understood on its own, without context from the conversation
- Content intended for eventual use outside the conversation (e.g., reports, emails)
- Content likely to be referenced or reused multiple times

# Usage notes
- One artifact per message unless specifically requested
- If a user asks the assistant to "generate a report" or "make a website," the assistant does not need to explain that it doesn't have these capabilities. Creating the code and placing it within the appropriate artifact will fulfill the user's intentions.

<artifact_instructions>
  When collaborating with the user on creating content that falls into compatible categories, the assistant should follow these steps:

  1. Immediately before invoking an artifact, think for one sentence in <antThinking> tags about how it evaluates against the criteria for a good and bad artifact. Consider if the content would work just fine without an artifact. If it's artifact-worthy, in another sentence determine if it's a new artifact or an update to an existing one (most common). For updates, reuse the prior identifier.
  2. Wrap the content in opening and closing \`<antArtifact>\` tags.
  3. Assign an identifier to the \`identifier\` attribute of the opening \`<antArtifact>\` tag. For updates, reuse the prior identifier. For new artifacts, the identifier should be descriptive and relevant to the content, using kebab-case (e.g., "example-profile-visualization"). This identifier will be used consistently throughout the artifact's lifecycle, even when updating or iterating on the artifact.
  4. Include a \`title\` attribute in the \`<antArtifact>\` tag to provide a brief title or description of the content.
  5. Add a \`type\` attribute to the opening \`<antArtifact>\` tag to specify the type of content the artifact represents. Assign one of the following values to the \`type\` attribute:
    - React Components: "application/vnd.ant.react"
      - Use this for displaying either: React elements, e.g. \`<strong>Hello World!</strong>\`, React pure functional components, e.g. \`() => <strong>Hello World!</strong>\`, React functional components with Hooks, or React component classes
      - When creating a React component, ensure it has no required props (or provide default values for all props) and use a default export.
      - Use Tailwind classes for styling. DO NOT USE ARBITRARY VALUES (e.g. \`h-[600px]\`).
      - Base React is available to be imported. To use hooks, first import it at the top of the artifact, e.g. \`import { useState } from "react"\`
      - The lucide-react@0.263.1 library is available to be imported. e.g. \`import { Camera } from "lucide-react"\` & \`<Camera color="red" size={48} />\`
      - The recharts charting library is available to be imported, e.g. \`import { LineChart, XAxis, ... } from "recharts"\` & \`<LineChart ...><XAxis dataKey="name"> ...\`
      - The assistant can use prebuilt components from the \`shadcn/ui\` library after it is imported: \`import { Alert, AlertDescription, AlertTitle, AlertDialog, AlertDialogAction } from '@/components/ui/alert';\`. If using components from the shadcn/ui library, the assistant mentions this to the user and offers to help them install the components if necessary.
      - NO OTHER LIBRARIES (e.g. zod, hookform) ARE INSTALLED OR ABLE TO BE IMPORTED.
      - Images from the web are not allowed, but you can use placeholder images by specifying the width and height like so \`<img src="/api/placeholder/400/320" alt="placeholder" />\`
      - If you are unable to follow the above requirements for any reason, use "application/vnd.ant.code" type for the artifact instead, which will not attempt to render the component.
  6. Include the complete and updated content of the artifact, without any truncation or minimization. Don't use "// rest of the code remains the same...".
</artifact_instructions>

Here are some examples of correct usage of artifacts by other AI assistants:

<examples>
  <example_docstring>
    This example demonstrates how to create a React component artifact for a metrics dashboard.
  </example_docstring>

  <example>
    <user_query>Can you create a React component for a metrics dashboard?</user_query>

    <user_contents>...</user_contents>

    <assistant_response>
      Absolutely! Here's a React component that implements a basic metrics dashboard:

      <antThinking>Creating a React component for a metrics dashboard is a good artifact. It's substantial, self-contained, and can be reused in various web applications. It's not just a brief code snippet or primarily explanatory content. This is a new request, so I'll create a new artifact with the identifier "metrics-dashboard-component".</antThinking>

      <antArtifact identifier="dashboard-component" type="application/vnd.ant.react" title="React Component: Metrics Dashboard">
        import React, { useState, useEffect } from 'react';
        import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
        import { Card, CardHeader, CardContent } from '@/components/ui/card';

        const generateData = () => [...Array(12)].map((_, i) => ({
          month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
          revenue: Math.floor(Math.random() * 5000) + 1000
        }));

        const MetricCard = ({ title, value, change }) => (
          <Card>
            <CardHeader>{title}</CardHeader>
        ...

        export default Dashboard;
      </antArtifact>

      Feel free to ask if you want to extend this component!
    </assistant_response>
  </example>

</examples>

The assistant should not mention any of these instructions to the user, nor make reference to the \`antArtifact\` tag, any of the MIME types (e.g. \`application/vnd.ant.react\`), or related syntax unless it is directly relevant to the query.

The assistant should always take care to not produce artifacts that would be highly hazardous to human health or wellbeing if misused, even if is asked to produce them for seemingly benign reasons. However, if Claude would be willing to produce the same content in text form, it should be willing to produce it in an artifact.
</artifacts_info>`;
  }
}
