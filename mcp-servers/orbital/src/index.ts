import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  listComponentsName,
  listComponentsSchema,
  listComponents,
} from "./tools/listComponents.js";
import {
  listPagesName,
  listPagesSchema,
  listPages,
} from "./tools/listPages.js";
import { startWsServer } from "./ws/server.js";

const server = new McpServer({
  name: "orbital",
  version: "0.0.1",
});

server.tool(listComponentsName, listComponentsSchema.shape, () => ({
  content: [{ type: "text", text: JSON.stringify(listComponents(), null, 2) }],
}));

server.tool(listPagesName, listPagesSchema.shape, () => ({
  content: [{ type: "text", text: JSON.stringify(listPages(), null, 2) }],
}));

startWsServer();

const transport = new StdioServerTransport();
await server.connect(transport);
console.log("[orbital-mcp] server ready");
