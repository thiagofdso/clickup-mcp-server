/**
 * SPDX-FileCopyrightText: © 2025 Talib Kareem <taazkareem@icloud.com>
 * SPDX-License-Identifier: MIT
 *
 * ClickUp MCP Task Tools
 * 
 * This is the main task module that connects tool definitions to their handlers.
 * The actual implementations are organized in sub-modules for better maintainability.
 */

import { sponsorService } from '../../utils/sponsor-service.js';
import { ClickUpServices } from '../../services/clickup/index.js';

// Import tool definitions
import {
  createTaskTool,
  getTaskTool,
  getTasksTool,
  updateTaskTool,
  moveTaskTool,
  duplicateTaskTool,
  deleteTaskTool,
  getTaskCommentsTool,
  createTaskCommentTool
} from './single-operations.js';

import {
  createBulkTasksTool,
  updateBulkTasksTool,
  moveBulkTasksTool,
  deleteBulkTasksTool
} from './bulk-operations.js';

import {
  getWorkspaceTasksTool
} from './workspace-operations.js';

// Import handlers
import {
  createTaskHandler,
  getTaskHandler,
  getTasksHandler,
  updateTaskHandler,
  moveTaskHandler,
  duplicateTaskHandler,
  deleteTaskHandler,
  getTaskCommentsHandler,
  createTaskCommentHandler,
  createBulkTasksHandler,
  updateBulkTasksHandler,
  moveBulkTasksHandler,
  deleteBulkTasksHandler,
  getWorkspaceTasksHandler,
} from './handlers.js';
import { formatTaskData } from './utilities.js';

import { BatchResult } from '../../utils/concurrency-utils.js';
import { ClickUpTask } from '../../services/clickup/types.js';

//=============================================================================
// HANDLER WRAPPER UTILITY
//=============================================================================

/**
 * Creates a wrapped handler function with standard error handling and response formatting
 */
function createHandlerWrapper<T>(
  handler: (services: ClickUpServices, params: any) => Promise<T>,
  formatResponse: (result: T) => any = (result) => result
) {
  return async (services: ClickUpServices, parameters: any) => {
    try {
      const result = await handler(services, parameters);
      return sponsorService.createResponse(formatResponse(result), true);
    } catch (error) {
      return sponsorService.createErrorResponse(error, parameters);
    }
  };
}

//=============================================================================
// SINGLE TASK OPERATIONS - HANDLER IMPLEMENTATIONS
//=============================================================================

export const handleCreateTask = createHandlerWrapper(createTaskHandler);
export const handleGetTask = createHandlerWrapper(getTaskHandler);
export const handleGetTasks = createHandlerWrapper(getTasksHandler, (tasks) => ({
  tasks,
  count: tasks.length
}));

export const handleUpdateTask = createHandlerWrapper(updateTaskHandler, formatTaskData);

export const handleMoveTask = createHandlerWrapper(moveTaskHandler);
export const handleDuplicateTask = createHandlerWrapper(duplicateTaskHandler);
export const handleDeleteTask = createHandlerWrapper(deleteTaskHandler, () => ({
  success: true,
  message: "Task deleted successfully"
}));
export const handleGetTaskComments = createHandlerWrapper(getTaskCommentsHandler, (comments) => ({
  comments,
  count: comments.length
}));
export const handleCreateTaskComment = createHandlerWrapper(createTaskCommentHandler, (comment) => ({
  success: true,
  message: "Comment added successfully",
  comment: comment && typeof comment === 'object' ? comment : {
    id: `generated-${Date.now()}`,
    comment_text: typeof comment === 'string' ? comment : "Comment text unavailable"
  }
}));

//=============================================================================
// BULK TASK OPERATIONS - HANDLER IMPLEMENTATIONS
//=============================================================================

export const handleCreateBulkTasks = createHandlerWrapper(createBulkTasksHandler, (result: BatchResult<ClickUpTask>) => ({
  successful: result.successful,
  failed: result.failed,
  count: result.totals.total,
  success_count: result.totals.success,
  failure_count: result.totals.failure,
  errors: result.failed.map(f => f.error)
}));

export const handleUpdateBulkTasks = createHandlerWrapper(updateBulkTasksHandler, (result: BatchResult<ClickUpTask>) => ({
  successful: result.successful,
  failed: result.failed,
  count: result.totals.total,
  success_count: result.totals.success,
  failure_count: result.totals.failure,
  errors: result.failed.map(f => f.error)
}));

export const handleMoveBulkTasks = createHandlerWrapper(moveBulkTasksHandler, (result: BatchResult<ClickUpTask>) => ({
  successful: result.successful,
  failed: result.failed,
  count: result.totals.total,
  success_count: result.totals.success,
  failure_count: result.totals.failure,
  errors: result.failed.map(f => f.error)
}));

export const handleDeleteBulkTasks = createHandlerWrapper(deleteBulkTasksHandler, (result: BatchResult<void>) => ({
  successful: result.successful,
  failed: result.failed,
  count: result.totals.total,
  success_count: result.totals.success,
  failure_count: result.totals.failure,
  errors: result.failed.map(f => f.error)
}));

//=============================================================================
// WORKSPACE TASK OPERATIONS - HANDLER IMPLEMENTATIONS
//=============================================================================

export const handleGetWorkspaceTasks = createHandlerWrapper(
  getWorkspaceTasksHandler,
  (response) => response // Pass through the response as is
);
