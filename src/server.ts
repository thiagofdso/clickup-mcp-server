/**
 * SPDX-FileCopyrightText: © 2025 Talib Kareem <taazkareem@icloud.com>
 * SPDX-License-Identifier: MIT
 *
 * MCP Server for ClickUp integration
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createClickUpServices, ClickUpServices } from "./services/clickup/index.js";
import config from "./config.js";
import { workspaceHierarchyTool, handleGetWorkspaceHierarchy } from "./tools/workspace.js";
import {
  createTaskTool,
  updateTaskTool,
  moveTaskTool,
  duplicateTaskTool,
  getTaskTool,
  deleteTaskTool,
  getTaskCommentsTool,
  createTaskCommentTool,
  createBulkTasksTool,
  updateBulkTasksTool,
  moveBulkTasksTool,
  deleteBulkTasksTool,
  attachTaskFileTool,
  getWorkspaceTasksTool,
  getTaskTimeEntriesTool,
  startTimeTrackingTool,
  stopTimeTrackingTool,
  addTimeEntryTool,
  deleteTimeEntryTool,
  getCurrentTimeEntryTool,
  handleCreateTask,
  handleUpdateTask,
  handleMoveTask,
  handleDuplicateTask,
  handleGetTasks,
  handleDeleteTask,
  handleGetTaskComments,
  handleCreateTaskComment,
  handleCreateBulkTasks,
  handleUpdateBulkTasks,
  handleMoveBulkTasks,
  handleDeleteBulkTasks,
  handleGetTask,
  handleAttachTaskFile,
  handleGetWorkspaceTasks,
  handleGetTaskTimeEntries,
  handleStartTimeTracking,
  handleStopTimeTracking,
  handleAddTimeEntry,
  handleDeleteTimeEntry,
  handleGetCurrentTimeEntry
} from "./tools/task/index.js";
import {
  createListTool, handleCreateList,
  createListInFolderTool, handleCreateListInFolder,
  getListTool, handleGetList,
  updateListTool, handleUpdateList,
  deleteListTool, handleDeleteList
} from "./tools/list.js";
import {
  createFolderTool, handleCreateFolder,
  getFolderTool, handleGetFolder,
  updateFolderTool, handleUpdateFolder,
  deleteFolderTool, handleDeleteFolder
} from "./tools/folder.js";
import {
  getSpaceTagsTool, handleGetSpaceTags,
  addTagToTaskTool, handleAddTagToTask,
  removeTagFromTaskTool, handleRemoveTagFromTask
} from "./tools/tag.js";
import {
  createDocumentTool, handleCreateDocument,
  getDocumentTool, handleGetDocument,
  listDocumentsTool, handleListDocuments,
  listDocumentPagesTool, handleListDocumentPages,
  getDocumentPagesTool, handleGetDocumentPages,
  createDocumentPageTool, handleCreateDocumentPage,
  updateDocumentPageTool, handleUpdateDocumentPage
} from "./tools/documents.js";

import {
  getWorkspaceMembersTool, handleGetWorkspaceMembers,
  findMemberByNameTool, handleFindMemberByName,
  resolveAssigneesTool, handleResolveAssignees
} from "./tools/member.js";

import { Logger } from "./logger.js";
import { clickUpServices } from "./services/shared.js";

// Create a logger instance for server
const logger = new Logger('Server');

/**
 * Determines if a tool should be enabled based on ENABLED_TOOLS and DISABLED_TOOLS configuration.
 *
 * Logic:
 * 1. If ENABLED_TOOLS is specified, only tools in that list are enabled (ENABLED_TOOLS takes precedence)
 * 2. If ENABLED_TOOLS is not specified but DISABLED_TOOLS is, all tools except those in DISABLED_TOOLS are enabled
 * 3. If neither is specified, all tools are enabled
 *
 * @param toolName - The name of the tool to check
 * @returns true if the tool should be enabled, false otherwise
 */
const isToolEnabled = (toolName: string): boolean => {
  // If ENABLED_TOOLS is specified, it takes precedence
  if (config.enabledTools.length > 0) {
    return config.enabledTools.includes(toolName);
  }

  // If only DISABLED_TOOLS is specified, enable all tools except those disabled
  if (config.disabledTools.length > 0) {
    return !config.disabledTools.includes(toolName);
  }

  // If neither is specified, enable all tools
  return true;
};

export const server = new Server(
  {
    name: "clickup-mcp-server",
    version: "0.8.5",
  },
  {
    capabilities: {
      tools: {},
      prompts: {},
      resources: {},
    },
  }
);

const documentModule = () => {
  if (config.documentSupport === 'true') {
    return [
      createDocumentTool,
      getDocumentTool,
      listDocumentsTool,
      listDocumentPagesTool,
      getDocumentPagesTool,
      createDocumentPageTool,
      updateDocumentPageTool,
    ]
  } else {
    return []
  }
}

/**
 * Configure the server routes and handlers
 */
export function configureServer() {
  logger.info("Registering server request handlers");

  // Register ListTools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.debug("Received ListTools request");
    return {
      tools: [
        workspaceHierarchyTool,
        createTaskTool,
        getTaskTool,
        updateTaskTool,
        moveTaskTool,
        duplicateTaskTool,
        deleteTaskTool,
        getTaskCommentsTool,
        createTaskCommentTool,
        attachTaskFileTool,
        createBulkTasksTool,
        updateBulkTasksTool,
        moveBulkTasksTool,
        deleteBulkTasksTool,
        getWorkspaceTasksTool,
        getTaskTimeEntriesTool,
        startTimeTrackingTool,
        stopTimeTrackingTool,
        addTimeEntryTool,
        deleteTimeEntryTool,
        getCurrentTimeEntryTool,
        createListTool,
        createListInFolderTool,
        getListTool,
        updateListTool,
        deleteListTool,
        createFolderTool,
        getFolderTool,
        updateFolderTool,
        deleteFolderTool,
        getSpaceTagsTool,
        addTagToTaskTool,
        removeTagFromTaskTool,
        getWorkspaceMembersTool,
        findMemberByNameTool,
        resolveAssigneesTool,
        ...documentModule()
      ].filter(tool => isToolEnabled(tool.name))
    };
  });

  // Add handler for resources/list
  server.setRequestHandler(ListResourcesRequestSchema, async (req) => {
    logger.debug("Received ListResources request");
    return { resources: [] };
  });

  // Register CallTool handler with proper logging
  logger.info("Registering tool handlers", {
    toolCount: 36,
    categories: ["workspace", "task", "time-tracking", "list", "folder", "tag", "member", "document"]
  });

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: params, _meta } = req.params;
    let servicesForRequest: ClickUpServices;

    if (config.headerAuthentication) {
      // Header-based authentication for API key only; team ID comes from config
      const { apiKey } = _meta || {};

      if (!apiKey) {
        throw new Error('Missing X-ClickUp-API-Key header');
      }

      if (!config.clickupTeamId) {
        throw new Error('Missing ClickUp team ID configuration');
      }

      servicesForRequest = createClickUpServices({
        apiKey: apiKey as string,
        teamId: config.clickupTeamId,
      });
    } else {
      // Global authentication
      servicesForRequest = clickUpServices;
    }


    // Improved logging with more context
    logger.info(`Received CallTool request for tool: ${name}`, {
      params
    });

    // Check if the tool is enabled
    if (!isToolEnabled(name)) {
      const reason = config.enabledTools.length > 0
        ? `Tool '${name}' is not in the enabled tools list.`
        : `Tool '${name}' is disabled.`;
      logger.warn(`Tool execution blocked: ${reason}`);
      throw {
        code: -32601,
        message: reason
      };
    }

    try {
      // Handle tool calls by routing to the appropriate handler
      switch (name) {
        case "get_workspace_hierarchy":
          return handleGetWorkspaceHierarchy(servicesForRequest);
        case "create_task":
          return handleCreateTask(servicesForRequest, params);
        case "update_task":
          return handleUpdateTask(servicesForRequest, params);
        case "move_task":
          return handleMoveTask(servicesForRequest, params);
        case "duplicate_task":
          return handleDuplicateTask(servicesForRequest, params);
        case "get_task":
          return handleGetTask(servicesForRequest, params);
        case "delete_task":
          return handleDeleteTask(servicesForRequest, params);
        case "get_task_comments":
          return handleGetTaskComments(servicesForRequest, params);
        case "create_task_comment":
          return handleCreateTaskComment(servicesForRequest, params);
        case "attach_task_file":
          return handleAttachTaskFile(servicesForRequest, params);
        case "create_bulk_tasks":
          return handleCreateBulkTasks(servicesForRequest, params);
        case "update_bulk_tasks":
          return handleUpdateBulkTasks(servicesForRequest, params);
        case "move_bulk_tasks":
          return handleMoveBulkTasks(servicesForRequest, params);
        case "delete_bulk_tasks":
          return handleDeleteBulkTasks(servicesForRequest, params);
        case "get_workspace_tasks":
          return handleGetWorkspaceTasks(servicesForRequest, params);
        case "create_list":
          return handleCreateList(servicesForRequest, params);
        case "create_list_in_folder":
          return handleCreateListInFolder(servicesForRequest, params);
        case "get_list":
          return handleGetList(servicesForRequest, params);
        case "update_list":
          return handleUpdateList(servicesForRequest, params);
        case "delete_list":
          return handleDeleteList(servicesForRequest, params);
        case "create_folder":
          return handleCreateFolder(servicesForRequest, params);
        case "get_folder":
          return handleGetFolder(servicesForRequest, params);
        case "update_folder":
          return handleUpdateFolder(servicesForRequest, params);
        case "delete_folder":
          return handleDeleteFolder(servicesForRequest, params);
        case "get_space_tags":
          return handleGetSpaceTags(servicesForRequest, params);
        case "add_tag_to_task":
          return handleAddTagToTask(servicesForRequest, params);
        case "remove_tag_from_task":
          return handleRemoveTagFromTask(servicesForRequest, params);
        case "get_task_time_entries":
          return handleGetTaskTimeEntries(servicesForRequest, params);
        case "start_time_tracking":
          return handleStartTimeTracking(servicesForRequest, params);
        case "stop_time_tracking":
          return handleStopTimeTracking(servicesForRequest, params);
        case "add_time_entry":
          return handleAddTimeEntry(servicesForRequest, params);
        case "delete_time_entry":
          return handleDeleteTimeEntry(servicesForRequest, params);
        case "get_current_time_entry":
          return handleGetCurrentTimeEntry(servicesForRequest, params);
        case "create_document":
          return handleCreateDocument(servicesForRequest, params);
        case "get_document":
          return handleGetDocument(servicesForRequest, params);
        case "list_documents":
          return handleListDocuments(servicesForRequest, params);
        case "list_document_pages":
          return handleListDocumentPages(servicesForRequest, params);
        case "get_document_pages":
          return handleGetDocumentPages(servicesForRequest, params);
        case "create_document_page":
          return handleCreateDocumentPage(servicesForRequest, params);
        case "update_document_page":
          return handleUpdateDocumentPage(servicesForRequest, params);
        case "get_workspace_members":
          return handleGetWorkspaceMembers(servicesForRequest);
        case "find_member_by_name":
          return handleFindMemberByName(servicesForRequest, params);
        case "resolve_assignees":
          return handleResolveAssignees(servicesForRequest, params);
        default:
          logger.error(`Unknown tool requested: ${name}`);
          const error = new Error(`Unknown tool: ${name}`);
          error.name = "UnknownToolError";
          throw error;
      }
    } catch (err) {
      logger.error(`Error executing tool: ${name}`, err);

      // Transform error to a more descriptive JSON-RPC error
      if (err.name === "UnknownToolError") {
        throw {
          code: -32601,
          message: `Method not found: ${name}`
        };
      } else if (err.name === "ValidationError") {
        throw {
          code: -32602,
          message: `Invalid params for tool ${name}: ${err.message}`
        };
      } else {
        // Generic server error
        throw {
          code: -32000,
          message: `Error executing tool ${name}: ${err.message}`
        };
      }
    }
  });

  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    logger.info("Received ListPrompts request");
    return { prompts: [] };
  });

  server.setRequestHandler(GetPromptRequestSchema, async () => {
    logger.error("Received GetPrompt request, but prompts are not supported");
    throw new Error("Prompt not found");
  });

  return server;
}
