/**
 * SPDX-FileCopyrightText: © 2025 Talib Kareem <taazkareem@icloud.com>
 * SPDX-License-Identifier: MIT
 *
 * Sprint task types
 */

import {
  ClickUpComment,
  ClickUpTask
} from '../types.js';

export interface SprintTaskQueryOptions {
  dueDateTimestamp: number;
  assigneeIds?: string[];
  listIds?: string[];
  includeComments?: boolean;
  includeSubtasks?: boolean;
}

export interface SprintTaskItem {
  id: string;
  name: string;
  status: ClickUpTask['status'];
  priority: ClickUpTask['priority'];
  dueDate: number | null;
  startDate: number | null;
  dateClosed: number | null;
  markdownDescription?: string;
  checklists: ClickUpTask['checklists'];
  comments?: ClickUpComment[];
  assignees: ClickUpTask['assignees'];
  tags: ClickUpTask['tags'];
  list: ClickUpTask['list'];
  folder: ClickUpTask['folder'];
  space: ClickUpTask['space'];
  subtasks: SprintTaskItem[];
}

export interface SprintTaskQueryResult {
  tasks: SprintTaskItem[];
  metadata: {
    dueDateFilter: number;
    teamMemberCount: number;
    taskCount: number;
    subtaskCount: number;
    listFilterCount?: number;
  };
}
