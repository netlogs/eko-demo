import { Eko, ClaudeProvider } from "@eko-ai/eko";
import { loadTools } from "@eko-ai/eko/web";

Eko.tools = loadTools();

export async function auto_test_case() {
  // Initialize LLM provider
  let llmProvider = new ClaudeProvider({
    // Please use your API endpoint for authentication and forwarding on the server side, do not expose API keys in the frontend
    baseURL: 'https://your-api-endpoint.com',
    // User Authentication Request Header
    defaultHeaders: {
      // 'Authorization': `Bearer ${getToken()}`
    },
    dangerouslyAllowBrowser: true
  });

  // Initialize eko
  let eko = new Eko(llmProvider);

  // Generate workflow from natural language description
  // Eko will automatically select and sequence the appropriate tools
  const workflow = await eko.generate(`
    Current login page automation test:
    1. Correct account and password are: admin / 666666 
    2. Please randomly combine usernames and passwords for testing to verify if login validation works properly, such as: username cannot be empty, password cannot be empty, incorrect username, incorrect password
    3. Finally, try to login with the correct account and password to verify if login is successful
    4. Generate test report and export
  `);

  // Execute
  await eko.execute(workflow);
}