/**
 * SPDX-FileCopyrightText: © 2025 Talib Kareem <taazkareem@icloud.com>
 * SPDX-License-Identifier: MIT
 *
 * Sprint task service
 */

import { Logger } from '../../../logger.js';
import { TaskService } from '../task/index.js';
import { WorkspaceService } from '../workspace.js';
import {
  ClickUpComment,
  ClickUpTask,
  ExtendedTaskFilters,
  TaskSummary
} from '../types.js';
import {
  SprintTaskItem,
  SprintTaskQueryOptions,
  SprintTaskQueryResult
} from './types.js';

export class SprintTaskService {
  private readonly logger = new Logger('SprintTaskService');

  constructor(
    private readonly taskService: TaskService,
    private readonly workspaceService: WorkspaceService
  ) {}

  /**
   * Retrieve sprint tasks using the configured ClickUp services.
   */
  async getSprintTasks(options: SprintTaskQueryOptions): Promise<SprintTaskQueryResult> {
    const providedAssignees = options.assigneeIds?.map(id => id.toString().trim()).filter(Boolean) ?? [];
    const providedListIds = options.listIds?.map(id => id.toString().trim()).filter(Boolean) ?? [];
    const includeSubtasks = options.includeSubtasks !== undefined ? options.includeSubtasks : true;
    const memberIdSet = providedAssignees.length > 0 ? new Set(providedAssignees) : undefined;

    const tasks = await this.fetchTasksForMembers(
      options.dueDateTimestamp,
      providedAssignees.length > 0 ? providedAssignees : undefined,
      providedListIds,
      includeSubtasks
    );
    const filteredTasks = tasks.filter(task =>
      this.isTaskEligible(task, options.dueDateTimestamp, memberIdSet, providedListIds)
    );

    if (filteredTasks.length === 0) {
      return {
        tasks: [],
        metadata: {
          dueDateFilter: options.dueDateTimestamp,
          teamMemberCount: memberIdSet?.size ?? 0,
          taskCount: 0,
          subtaskCount: 0,
          listFilterCount: providedListIds.length || undefined
        }
      };
    }

    const childrenMap = includeSubtasks ? this.buildChildrenMap(filteredTasks) : new Map<string, ClickUpTask[]>();
    const rootTasks = includeSubtasks ? this.resolveRootTasks(filteredTasks, childrenMap) : filteredTasks;
    const commentMap = options.includeComments
      ? await this.fetchComments(filteredTasks.map(task => task.id))
      : new Map<string, ClickUpComment[]>();

    const sprintTasks = rootTasks.map(task =>
      this.toSprintTask(task, childrenMap, commentMap)
    );
    const subtaskCount = includeSubtasks ? sprintTasks.reduce(
      (total, task) => total + this.countSubtasks(task),
      0,
    ) : 0;

    return {
      tasks: sprintTasks,
      metadata: {
        dueDateFilter: options.dueDateTimestamp,
        teamMemberCount: memberIdSet?.size ?? 0,
        taskCount: sprintTasks.length,
        subtaskCount,
        listFilterCount: providedListIds.length || undefined
      }
    };
  }

  private async fetchTasksForMembers(
    dueDateTimestamp: number,
    memberIds: string[] | undefined,
    listIds: string[],
    includeSubtasks: boolean
  ): Promise<ClickUpTask[]> {
    let page = 0;
    let hasMore = true;
    const tasks: ClickUpTask[] = [];

    while (hasMore) {
      const filters: ExtendedTaskFilters = {
        detail_level: 'detailed',
        include_closed: true,
        due_date_gt: dueDateTimestamp,
        subtasks: includeSubtasks,
        include_subtasks: includeSubtasks,
        include_markdown_description: true,
        page
      };

      if (memberIds && memberIds.length > 0) {
        filters.assignees = memberIds;
      }
      if (listIds.length > 0) {
        filters.list_ids = listIds;
      }

      const response = await this.taskService.getWorkspaceTasks(filters);

      if ('tasks' in response) {
        const batch = response.tasks || [];
        tasks.push(...batch);

        hasMore = Boolean(response.has_more);
        page = response.next_page ?? page + 1;
      } else {
        const detailedTasks = await this.fetchDetailedTasksFromSummaries(response.summaries || []);
        tasks.push(...detailedTasks);
        hasMore = false;
      }
    }

    return tasks;
  }

  private async fetchDetailedTasksFromSummaries(summaries: TaskSummary[]): Promise<ClickUpTask[]> {
    if (!summaries.length) return [];

    const results = await Promise.allSettled(
      summaries.map(summary => this.taskService.getTask(summary.id))
    );

    const tasks: ClickUpTask[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        tasks.push(result.value);
      } else {
        this.logger.warn('Failed to fetch detailed task from summary', result.reason);
      }
    }

    return tasks;
  }

  private isTaskEligible(
    task: ClickUpTask,
    dueDateTimestamp: number,
    memberIds: Set<string> | undefined,
    listIds: string[]
  ): boolean {
    const dueDate = this.toNumber(task.due_date);
    if (dueDate !== null && dueDate < dueDateTimestamp) {
      return false;
    }

    if (listIds.length > 0) {
      const belongsToList = task.list && listIds.includes(task.list.id);
      if (!belongsToList) {
        return false;
      }
    }

    if (memberIds && memberIds.size > 0) {
      if (!task.assignees || task.assignees.length === 0) {
        return false;
      }

      const hasTeamAssignee = task.assignees.some(assignee =>
        assignee && assignee.id !== undefined && memberIds.has(String(assignee.id))
      );

      if (!hasTeamAssignee) {
        return false;
      }
    }

    return true;
  }

  private buildChildrenMap(tasks: ClickUpTask[]): Map<string, ClickUpTask[]> {
    const map = new Map<string, ClickUpTask[]>();

    for (const task of tasks) {
      if (!task.parent) continue;
      if (!map.has(task.parent)) {
        map.set(task.parent, []);
      }
      map.get(task.parent)!.push(task);
    }

    return map;
  }

  private resolveRootTasks(
    tasks: ClickUpTask[],
    childrenMap: Map<string, ClickUpTask[]>
  ): ClickUpTask[] {
    const taskIds = new Set(tasks.map(task => task.id));

    return tasks.filter(task => !task.parent || !taskIds.has(task.parent));
  }

  private async fetchComments(taskIds: string[]): Promise<Map<string, ClickUpComment[]>> {
    const uniqueIds = Array.from(new Set(taskIds));
    const entries = await Promise.all(
      uniqueIds.map(async (taskId): Promise<[string, ClickUpComment[]]> => {
        try {
          const comments = await this.taskService.comments.getTaskComments(taskId);
          return [taskId, comments];
        } catch (error) {
          this.logger.warn(`Failed to fetch comments for task ${taskId}`, error);
          return [taskId, [] as ClickUpComment[]];
        }
      })
    );

    return new Map(entries);
  }

  private toSprintTask(
    task: ClickUpTask,
    childrenMap: Map<string, ClickUpTask[]>,
    commentMap: Map<string, ClickUpComment[]>
  ): SprintTaskItem {
    const childTasks = childrenMap.get(task.id) || [];

    const subtasks = childTasks
      .map(child => this.toSprintTask(child, childrenMap, commentMap))
      .filter(Boolean);

    return {
      id: task.id,
      name: task.name,
      status: task.status,
      priority: task.priority,
      dueDate: this.toNumber(task.due_date),
      startDate: this.toNumber(task.start_date),
      dateClosed: this.toNumber(task.date_closed),
      markdownDescription: task.markdown_description || task.description,
      checklists: task.checklists || [],
      comments: commentMap.get(task.id),
      assignees: task.assignees || [],
      tags: task.tags || [],
      list: task.list,
      folder: task.folder,
      space: task.space,
      subtasks
    };
  }

  private toNumber(value?: string | null): number | null {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private countSubtasks(task: SprintTaskItem): number {
    if (!task.subtasks.length) {
      return 0;
    }

    return task.subtasks.reduce(
      (total, subtask) => total + 1 + this.countSubtasks(subtask),
      0
    );
  }
}
