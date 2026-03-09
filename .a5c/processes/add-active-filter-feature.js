/**
 * @process add-active-filter-feature
 * @description Add "active" boolean field to task configuration for filtering batch report downloads
 * @inputs { featureName: string }
 * @outputs { success: boolean }
 */

import { defineTask } from '@a5c-ai/babysitter-sdk';

/**
 * Feature Development Process - Active Filter for Tasks
 *
 * Steps:
 * 1. Implement backend model changes
 * 2. Verify backend changes work
 * 3. Implement frontend type and UI changes
 * 4. Integration testing
 * 5. Final verification
 */
export async function process(inputs, ctx) {
  const { featureName = 'active-filter' } = inputs;

  // Phase 1: Backend Implementation
  const backendResult = await ctx.task(implementBackendChangesTask, { featureName });

  // Phase 2: Backend Verification
  const backendVerify = await ctx.task(verifyBackendChangesTask, { backendResult });

  if (!backendVerify.success) {
    // Quality gate loop for backend
    let retries = 0;
    let fixed = false;
    while (!fixed && retries < 3) {
      const fixResult = await ctx.task(fixBackendIssuesTask, {
        issues: backendVerify.issues
      });
      const reVerify = await ctx.task(verifyBackendChangesTask, {
        backendResult: fixResult
      });
      fixed = reVerify.success;
      retries++;
    }
    if (!fixed) {
      await ctx.breakpoint({
        question: 'Backend verification failed after 3 attempts. Review and approve to continue or abort.',
        title: 'Backend Issues',
        context: { runId: ctx.runId }
      });
    }
  }

  // Phase 3: Frontend Implementation
  const frontendResult = await ctx.task(implementFrontendChangesTask, { featureName });

  // Phase 4: Frontend Verification
  const frontendVerify = await ctx.task(verifyFrontendChangesTask, { frontendResult });

  if (!frontendVerify.success) {
    // Quality gate loop for frontend
    let retries = 0;
    let fixed = false;
    while (!fixed && retries < 3) {
      const fixResult = await ctx.task(fixFrontendIssuesTask, {
        issues: frontendVerify.issues
      });
      const reVerify = await ctx.task(verifyFrontendChangesTask, {
        frontendResult: fixResult
      });
      fixed = reVerify.success;
      retries++;
    }
  }

  // Phase 5: Integration Test
  const integrationResult = await ctx.task(integrationTestTask, { featureName });

  // Final approval
  await ctx.breakpoint({
    question: 'All changes implemented. Review and approve for completion.',
    title: 'Feature Complete',
    context: { runId: ctx.runId }
  });

  return {
    success: true,
    featureName,
    backendResult,
    frontendResult,
    integrationResult
  };
}

// Backend implementation task
export const implementBackendChangesTask = defineTask('implement-backend', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Implement backend changes for active filter',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Backend Python Developer',
      task: `Add "active" boolean field to task configuration in the Alma Analytics Report Fetcher backend.`,
      context: {
        featureName: args.featureName,
        requirements: [
          'Add active: bool = True field to TaskBase model in backend/models/task.py',
          'Update _task_from_dict in config_manager.py to read ACTIVE field (default True)',
          'Update _task_to_dict in config_manager.py to write ACTIVE field',
          'Update run_batch_reports in fetch_reports_from_alma_analytics.py to filter by active=True when filtering by frequency'
        ]
      },
      instructions: [
        'Read the current files first',
        'Make minimal changes to add the active field',
        'Ensure backwards compatibility - existing tasks without ACTIVE should default to True',
        'Return a summary of changes made'
      ],
      outputFormat: 'JSON with fields: success, filesModified, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'filesModified', 'summary'],
      properties: {
        success: { type: 'boolean' },
        filesModified: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['agent', 'backend', 'implementation']
}));

// Backend verification task
export const verifyBackendChangesTask = defineTask('verify-backend', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Verify backend changes',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'QA Engineer',
      task: 'Verify the backend changes for the active filter feature are correct.',
      context: { previousResult: args.backendResult },
      instructions: [
        'Read the modified files',
        'Check that active field is properly defined with default True',
        'Check that config_manager reads/writes ACTIVE correctly',
        'Check that batch reports filter includes active check',
        'Run Python syntax check on modified files',
        'Return verification result'
      ],
      outputFormat: 'JSON with fields: success, issues (array of strings if any)'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: {
        success: { type: 'boolean' },
        issues: { type: 'array', items: { type: 'string' } }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['agent', 'backend', 'verification']
}));

// Fix backend issues task
export const fixBackendIssuesTask = defineTask('fix-backend-issues', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Fix backend issues',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Backend Developer',
      task: 'Fix the reported backend issues.',
      context: { issues: args.issues },
      instructions: [
        'Address each issue reported',
        'Make minimal changes to fix the problems',
        'Return summary of fixes'
      ],
      outputFormat: 'JSON with fields: success, fixesMade'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'fixesMade'],
      properties: {
        success: { type: 'boolean' },
        fixesMade: { type: 'array', items: { type: 'string' } }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['agent', 'backend', 'fix']
}));

// Frontend implementation task
export const implementFrontendChangesTask = defineTask('implement-frontend', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Implement frontend changes for active filter',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Frontend React/TypeScript Developer',
      task: 'Add "active" boolean field to the frontend UI for task management.',
      context: {
        featureName: args.featureName,
        requirements: [
          'Add active: boolean field to Task, TaskCreate, TaskUpdate interfaces in frontend/src/types/index.ts',
          'Update TaskCard.tsx to show active status badge and add toggle button',
          'Update TaskForm.tsx to include active checkbox (default true for new tasks)',
          'Style the active/inactive state visually distinct'
        ]
      },
      instructions: [
        'Read the current files first',
        'Add active field to types',
        'Add visual indicator (badge or icon) showing active/inactive on TaskCard',
        'Add a toggle button/switch to activate/deactivate tasks',
        'Update TaskForm to include active toggle',
        'Return summary of changes'
      ],
      outputFormat: 'JSON with fields: success, filesModified, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'filesModified', 'summary'],
      properties: {
        success: { type: 'boolean' },
        filesModified: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['agent', 'frontend', 'implementation']
}));

// Frontend verification task
export const verifyFrontendChangesTask = defineTask('verify-frontend', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Verify frontend changes',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Frontend QA Engineer',
      task: 'Verify the frontend changes for the active filter feature.',
      context: { previousResult: args.frontendResult },
      instructions: [
        'Read the modified frontend files',
        'Check TypeScript types are correct',
        'Run TypeScript compiler to check for errors',
        'Verify the UI components handle active state',
        'Return verification result'
      ],
      outputFormat: 'JSON with fields: success, issues (array if any)'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: {
        success: { type: 'boolean' },
        issues: { type: 'array', items: { type: 'string' } }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['agent', 'frontend', 'verification']
}));

// Fix frontend issues task
export const fixFrontendIssuesTask = defineTask('fix-frontend-issues', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Fix frontend issues',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Frontend Developer',
      task: 'Fix the reported frontend issues.',
      context: { issues: args.issues },
      instructions: [
        'Address each issue reported',
        'Make minimal changes to fix',
        'Return summary of fixes'
      ],
      outputFormat: 'JSON with fields: success, fixesMade'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'fixesMade'],
      properties: {
        success: { type: 'boolean' },
        fixesMade: { type: 'array', items: { type: 'string' } }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['agent', 'frontend', 'fix']
}));

// Integration test task
export const integrationTestTask = defineTask('integration-test', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Integration testing',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Integration Tester',
      task: 'Verify the complete active filter feature works end-to-end.',
      context: { featureName: args.featureName },
      instructions: [
        'Review all changes made to backend and frontend',
        'Check that types match between frontend and backend',
        'Verify the feature flow: task active status can be changed and filters batch downloads',
        'Run TypeScript check on frontend',
        'Run Python syntax check on backend',
        'Return integration test result'
      ],
      outputFormat: 'JSON with fields: success, testResults, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'summary'],
      properties: {
        success: { type: 'boolean' },
        testResults: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['agent', 'integration', 'testing']
}));
