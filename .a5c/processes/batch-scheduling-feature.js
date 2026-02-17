/**
 * @process batch-scheduling-feature
 * @description Implement batch report scheduling with frequency field (daily/weekly)
 * @inputs { dailyReports: string[], weeklyReports: string[], continueOnError: boolean }
 * @outputs { success: boolean, filesModified: string[], summary: string }
 */

import { defineTask } from '@a5c-ai/babysitter-sdk';

/**
 * Batch Report Scheduling Feature Implementation
 *
 * Implements:
 * 1. Add "frequency" field to task model
 * 2. Update config_manager to handle frequency
 * 3. Update reports_config.json with frequency values
 * 4. Modify CLI script to accept --report-type flag
 * 5. Test the implementation
 */
export async function process(inputs, ctx) {
  const {
    dailyReports = ['aas_loans', 'aas_course_reserves'],
    weeklyReports = ['aas_titles', 'collection_name_for_ckb', 'e_titles_for_usage',
                     'aac_rialto_invoices', 'users_openathens', 'inventory_usage_with_pol_collections',
                     'inventory_usage_with_pol_titles', 'funds_of_polines', 'AAM_titles'],
    continueOnError = true
  } = inputs;

  // ============================================================================
  // PHASE 1: UPDATE PYDANTIC MODELS
  // ============================================================================

  const modelUpdateResult = await ctx.task(updatePydanticModelTask, {
    modelFile: 'backend/models/task.py',
    newField: 'frequency',
    fieldType: 'str',
    allowedValues: ['daily', 'weekly'],
    defaultValue: 'daily'
  });

  // ============================================================================
  // PHASE 2: UPDATE CONFIG MANAGER
  // ============================================================================

  const configManagerResult = await ctx.task(updateConfigManagerTask, {
    configManagerFile: 'backend/core/config_manager.py',
    newField: 'frequency',
    jsonKey: 'FREQUENCY'
  });

  // ============================================================================
  // PHASE 3: UPDATE REPORTS CONFIG JSON
  // ============================================================================

  const configJsonResult = await ctx.task(updateReportsConfigTask, {
    configFile: 'reports_config.json',
    dailyReports,
    weeklyReports
  });

  // ============================================================================
  // PHASE 4: UPDATE CLI SCRIPT
  // ============================================================================

  const cliUpdateResult = await ctx.task(updateCliScriptTask, {
    cliFile: 'fetch_reports_from_alma_analytics.py',
    continueOnError
  });

  // ============================================================================
  // PHASE 5: VERIFICATION
  // ============================================================================

  await ctx.breakpoint({
    question: 'All code changes complete. Review the modifications and approve for final verification?',
    title: 'Code Review Checkpoint',
    context: {
      runId: ctx.runId,
      files: [
        { path: 'backend/models/task.py', format: 'code', language: 'python' },
        { path: 'backend/core/config_manager.py', format: 'code', language: 'python' },
        { path: 'reports_config.json', format: 'code', language: 'json' },
        { path: 'fetch_reports_from_alma_analytics.py', format: 'code', language: 'python' }
      ]
    }
  });

  const verificationResult = await ctx.task(verifyImplementationTask, {
    filesToCheck: [
      'backend/models/task.py',
      'backend/core/config_manager.py',
      'reports_config.json',
      'fetch_reports_from_alma_analytics.py'
    ],
    dailyReports,
    weeklyReports
  });

  // ============================================================================
  // FINAL SUMMARY
  // ============================================================================

  return {
    success: verificationResult.success,
    filesModified: [
      'backend/models/task.py',
      'backend/core/config_manager.py',
      'reports_config.json',
      'fetch_reports_from_alma_analytics.py'
    ],
    summary: `Batch scheduling feature implemented. Daily reports: ${dailyReports.length}, Weekly reports: ${weeklyReports.length}. Continue on error: ${continueOnError}`,
    phases: {
      modelUpdate: modelUpdateResult,
      configManager: configManagerResult,
      configJson: configJsonResult,
      cliUpdate: cliUpdateResult,
      verification: verificationResult
    }
  };
}

// ============================================================================
// TASK DEFINITIONS
// ============================================================================

/**
 * Update Pydantic model with frequency field
 */
export const updatePydanticModelTask = defineTask('update-pydantic-model', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Update Pydantic task model',
  description: 'Add frequency field to TaskBase model',

  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Python developer',
      task: `Update the Pydantic model in ${args.modelFile} to add a "${args.newField}" field`,
      context: {
        modelFile: args.modelFile,
        newField: args.newField,
        fieldType: args.fieldType,
        allowedValues: args.allowedValues,
        defaultValue: args.defaultValue
      },
      instructions: [
        `Read the file ${args.modelFile}`,
        `Add a new field "${args.newField}" of type Optional[Literal["daily", "weekly"]] with default value "${args.defaultValue}" to TaskBase class`,
        'Import Literal from typing if not already imported',
        'The field should be optional to maintain backward compatibility',
        'Use the Edit tool to make the changes',
        'Return summary of changes made'
      ],
      outputFormat: 'JSON with success (boolean), changes (string), filesModified (array)'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'changes'],
      properties: {
        success: { type: 'boolean' },
        changes: { type: 'string' },
        filesModified: { type: 'array', items: { type: 'string' } }
      }
    }
  },

  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },

  labels: ['backend', 'model']
}));

/**
 * Update config manager to handle frequency field
 */
export const updateConfigManagerTask = defineTask('update-config-manager', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Update config manager',
  description: 'Add frequency field handling to ConfigManager',

  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Python developer',
      task: `Update ${args.configManagerFile} to handle the "${args.newField}" field`,
      context: {
        configManagerFile: args.configManagerFile,
        newField: args.newField,
        jsonKey: args.jsonKey
      },
      instructions: [
        `Read the file ${args.configManagerFile}`,
        'Update _task_from_dict method to read FREQUENCY from config dict and map to frequency field',
        'Update _task_to_dict method to write frequency field as FREQUENCY to config dict',
        'Handle cases where FREQUENCY is not present (default to "daily" for backward compatibility)',
        'Use the Edit tool to make the changes',
        'Return summary of changes made'
      ],
      outputFormat: 'JSON with success (boolean), changes (string), filesModified (array)'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'changes'],
      properties: {
        success: { type: 'boolean' },
        changes: { type: 'string' },
        filesModified: { type: 'array', items: { type: 'string' } }
      }
    }
  },

  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },

  labels: ['backend', 'config']
}));

/**
 * Update reports_config.json with frequency values
 */
export const updateReportsConfigTask = defineTask('update-reports-config', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Update reports config JSON',
  description: 'Add FREQUENCY field to each report in config',

  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Developer',
      task: `Update ${args.configFile} to add FREQUENCY field to each report`,
      context: {
        configFile: args.configFile,
        dailyReports: args.dailyReports,
        weeklyReports: args.weeklyReports
      },
      instructions: [
        `Read the file ${args.configFile}`,
        `For each report in dailyReports (${args.dailyReports.join(', ')}), add "FREQUENCY": "daily"`,
        `For each report in weeklyReports (${args.weeklyReports.join(', ')}), add "FREQUENCY": "weekly"`,
        'Use the Edit tool to make the changes for each report',
        'Return summary of changes made'
      ],
      outputFormat: 'JSON with success (boolean), changes (string), reportsUpdated (number)'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'changes'],
      properties: {
        success: { type: 'boolean' },
        changes: { type: 'string' },
        reportsUpdated: { type: 'number' }
      }
    }
  },

  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },

  labels: ['config', 'json']
}));

/**
 * Update CLI script to support batch execution
 */
export const updateCliScriptTask = defineTask('update-cli-script', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Update CLI script for batch execution',
  description: 'Add --report-type flag and batch execution logic',

  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Python developer',
      task: `Update ${args.cliFile} to support batch report execution by frequency`,
      context: {
        cliFile: args.cliFile,
        continueOnError: args.continueOnError
      },
      instructions: [
        `Read the file ${args.cliFile}`,
        'Add a new argument --report-type that accepts "daily" or "weekly"',
        'Make --task optional (required only if --report-type is not provided)',
        'When --report-type is provided: filter reports by FREQUENCY field and run them sequentially',
        `Continue on error: ${args.continueOnError} - if a report fails, log the error and continue with next report`,
        'Add summary logging at the end showing how many reports succeeded/failed',
        'Keep backward compatibility: if --task is provided, run single task as before',
        'Use the Edit tool to make the changes',
        'Return summary of changes made'
      ],
      outputFormat: 'JSON with success (boolean), changes (string), newFeatures (array)'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'changes'],
      properties: {
        success: { type: 'boolean' },
        changes: { type: 'string' },
        newFeatures: { type: 'array', items: { type: 'string' } }
      }
    }
  },

  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },

  labels: ['cli', 'python']
}));

/**
 * Verify the implementation
 */
export const verifyImplementationTask = defineTask('verify-implementation', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Verify implementation',
  description: 'Check all changes are correct and consistent',

  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'QA engineer',
      task: 'Verify the batch scheduling implementation is complete and correct',
      context: {
        filesToCheck: args.filesToCheck,
        dailyReports: args.dailyReports,
        weeklyReports: args.weeklyReports
      },
      instructions: [
        'Read each file in filesToCheck',
        'Verify Pydantic model has frequency field with Literal["daily", "weekly"]',
        'Verify config_manager reads/writes FREQUENCY field',
        'Verify reports_config.json has FREQUENCY for all reports',
        'Verify CLI script has --report-type argument and batch execution logic',
        'Check for any syntax errors or issues',
        'Run python -m py_compile on Python files to check syntax',
        'Return verification results'
      ],
      outputFormat: 'JSON with success (boolean), checks (object with file results), issues (array)'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'checks'],
      properties: {
        success: { type: 'boolean' },
        checks: { type: 'object' },
        issues: { type: 'array', items: { type: 'string' } }
      }
    }
  },

  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },

  labels: ['verification', 'qa']
}));
