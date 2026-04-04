import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { startWsServer } from "./ws/server.js";

// Existing tools
import { listComponentsName, listComponentsSchema, listComponents } from "./tools/listComponents.js";

// New tools
import { loadSceneName, loadSceneSchema, loadScene } from "./tools/loadScene.js";
import { listScenesName, listScenesSchema, listScenes } from "./tools/listScenes.js";
import { setBodyName, setBodySchema, setBody } from "./tools/setBody.js";
import { controlSimName, controlSimSchema, controlSim } from "./tools/controlSim.js";
import { getSimStateName, getSimStateSchema, getSimState } from "./tools/getSimState.js";
import { setCameraName, setCameraSchema, setCamera } from "./tools/setCamera.js";
import { addLabelName, addLabelSchema, addLabel } from "./tools/addLabel.js";

const server = new McpServer({ name: "orbital", version: "0.1.0" });

// Catalogue tools
server.tool(listComponentsName, listComponentsSchema.shape, () => ({
  content: [{ type: "text", text: JSON.stringify(listComponents(), null, 2) }],
}));

server.tool(listScenesName, listScenesSchema.shape, () => ({
  content: [{ type: "text", text: JSON.stringify(listScenes(), null, 2) }],
}));

// Scene control tools
server.tool(loadSceneName, loadSceneSchema.shape, ({ id }) => ({
  content: [{ type: "text", text: loadScene({ id }) }],
}));

server.tool(setBodyName, setBodySchema.shape, (input) => ({
  content: [{ type: "text", text: setBody(input) }],
}));

server.tool(controlSimName, controlSimSchema.shape, (input) => ({
  content: [{ type: "text", text: controlSim(input) }],
}));

server.tool(getSimStateName, getSimStateSchema.shape, () => ({
  content: [{ type: "text", text: getSimState() }],
}));

server.tool(setCameraName, setCameraSchema.shape, (input) => ({
  content: [{ type: "text", text: setCamera(input) }],
}));

server.tool(addLabelName, addLabelSchema.shape, (input) => ({
  content: [{ type: "text", text: addLabel(input) }],
}));

startWsServer();

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[orbital-mcp] server ready — 8 tools registered");
