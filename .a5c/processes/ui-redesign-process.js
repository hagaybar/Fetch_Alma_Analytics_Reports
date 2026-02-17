/**
 * @process ui-redesign
 * @description UI Redesign with quality convergence - Transform frontend to match design examples
 * @inputs { targetQuality: number, maxIterations: number }
 * @outputs { success: boolean, iterations: number, finalQuality: number, componentsUpdated: array }
 */

import { defineTask } from '@a5c-ai/babysitter-sdk';

/**
 * UI Redesign Process
 *
 * Phases:
 * 1. Foundation Setup - Design system (colors, fonts, icons)
 * 2. Layout Components - Sidebar and MainLayout
 * 3. UI Components - Button, Card, Modal, Input, Select, Badge
 * 4. Feature Components - TaskCard, TaskForm, TaskList
 * 5. Pages - Dashboard, TasksPage, LogsPage
 * 6. Integration & Polish - Final visual verification
 */
export async function process(inputs, ctx) {
  const {
    targetQuality = 90,
    maxIterations = 3
  } = inputs;

  // ============================================================================
  // PHASE 1: FOUNDATION SETUP
  // ============================================================================

  const foundationResult = await ctx.task(designSystemSetupTask, {
    designExamples: inputs.designExamples,
    theme: {
      colors: {
        primary: '#4F46E5',
        backgroundLight: '#F9FAFB',
        backgroundDark: '#111827'
      },
      fonts: ['Inter'],
      borderRadius: '12px'
    }
  });

  await ctx.breakpoint({
    question: 'Foundation setup complete (Tailwind config, CSS variables, fonts). Review and approve to continue?',
    title: 'Phase 1: Foundation Review',
    context: {
      runId: ctx.runId,
      files: [
        { path: 'frontend/src/index.css', format: 'code', language: 'css' },
        { path: 'frontend/tailwind.config.js', format: 'code', language: 'javascript' }
      ]
    }
  });

  // ============================================================================
  // PHASE 2: LAYOUT COMPONENTS
  // ============================================================================

  const layoutResult = await ctx.task(layoutComponentsTask, {
    components: ['Sidebar', 'MainLayout', 'Header'],
    designSystem: foundationResult
  });

  await ctx.breakpoint({
    question: 'Layout components updated (Sidebar, MainLayout, Header). Review and approve to continue?',
    title: 'Phase 2: Layout Review',
    context: {
      runId: ctx.runId,
      files: [
        { path: 'frontend/src/components/layout/Sidebar.tsx', format: 'code', language: 'typescript' },
        { path: 'frontend/src/components/layout/MainLayout.tsx', format: 'code', language: 'typescript' }
      ]
    }
  });

  // ============================================================================
  // PHASE 3: UI COMPONENTS
  // ============================================================================

  const uiComponentsResult = await ctx.task(uiComponentsTask, {
    components: ['Button', 'Card', 'Modal', 'Input', 'Select', 'Badge'],
    designSystem: foundationResult
  });

  await ctx.breakpoint({
    question: 'UI components updated (Button, Card, Modal, Input, Select, Badge). Review and approve to continue?',
    title: 'Phase 3: UI Components Review',
    context: {
      runId: ctx.runId,
      files: [
        { path: 'frontend/src/components/ui/Button.tsx', format: 'code', language: 'typescript' },
        { path: 'frontend/src/components/ui/Card.tsx', format: 'code', language: 'typescript' },
        { path: 'frontend/src/components/ui/Modal.tsx', format: 'code', language: 'typescript' }
      ]
    }
  });

  // ============================================================================
  // PHASE 4: FEATURE COMPONENTS
  // ============================================================================

  const featureComponentsResult = await ctx.task(featureComponentsTask, {
    components: ['TaskCard', 'TaskForm', 'TaskList'],
    designSystem: foundationResult,
    designExamples: inputs.designExamples
  });

  await ctx.breakpoint({
    question: 'Feature components updated (TaskCard, TaskForm, TaskList). Review and approve to continue?',
    title: 'Phase 4: Feature Components Review',
    context: {
      runId: ctx.runId,
      files: [
        { path: 'frontend/src/components/tasks/TaskCard.tsx', format: 'code', language: 'typescript' },
        { path: 'frontend/src/components/tasks/TaskForm.tsx', format: 'code', language: 'typescript' }
      ]
    }
  });

  // ============================================================================
  // PHASE 5: PAGES
  // ============================================================================

  const pagesResult = await ctx.task(pagesTask, {
    pages: ['TasksPage', 'Dashboard', 'LogsPage'],
    designSystem: foundationResult
  });

  await ctx.breakpoint({
    question: 'Pages updated (TasksPage, Dashboard, LogsPage). Review and approve to continue?',
    title: 'Phase 5: Pages Review',
    context: {
      runId: ctx.runId,
      files: [
        { path: 'frontend/src/pages/TasksPage.tsx', format: 'code', language: 'typescript' },
        { path: 'frontend/src/pages/Dashboard.tsx', format: 'code', language: 'typescript' }
      ]
    }
  });

  // ============================================================================
  // PHASE 6: QUALITY CONVERGENCE LOOP
  // ============================================================================

  let iteration = 0;
  let currentQuality = 0;
  let converged = false;
  const iterationResults = [];

  while (iteration < maxIterations && !converged) {
    iteration++;

    // Visual verification using browser
    const visualTestResult = await ctx.task(visualVerificationTask, {
      iteration,
      checkPoints: ['sidebar', 'task-cards', 'task-form-modal', 'header']
    });

    // Build check
    const buildResult = await ctx.task(buildCheckTask, {});

    // Quality scoring
    const qualityScore = await ctx.task(qualityScoringTask, {
      iteration,
      targetQuality,
      visualTestResult,
      buildResult,
      designExamples: inputs.designExamples
    });

    currentQuality = qualityScore.overallScore;

    iterationResults.push({
      iteration,
      quality: currentQuality,
      visualTest: visualTestResult,
      build: buildResult,
      feedback: qualityScore.recommendations
    });

    if (currentQuality >= targetQuality) {
      converged = true;
    } else if (iteration < maxIterations) {
      // Refinement task
      await ctx.task(refinementTask, {
        feedback: qualityScore.recommendations,
        issues: qualityScore.issues,
        iteration
      });

      await ctx.breakpoint({
        question: `Iteration ${iteration} complete. Quality: ${currentQuality}/${targetQuality}. Continue refinement?`,
        title: `Iteration ${iteration} Review`,
        context: {
          runId: ctx.runId,
          files: [
            { path: `artifacts/iteration-${iteration}-report.md`, format: 'markdown' }
          ]
        }
      });
    }
  }

  // ============================================================================
  // FINAL REVIEW
  // ============================================================================

  await ctx.breakpoint({
    question: `UI Redesign complete. Quality: ${currentQuality}/${targetQuality}. Approve final result?`,
    title: 'Final Review',
    context: {
      runId: ctx.runId,
      files: [
        { path: 'artifacts/final-report.md', format: 'markdown' }
      ]
    }
  });

  return {
    success: converged,
    iterations: iteration,
    finalQuality: currentQuality,
    targetQuality,
    componentsUpdated: [
      ...foundationResult.filesModified || [],
      ...layoutResult.filesModified || [],
      ...uiComponentsResult.filesModified || [],
      ...featureComponentsResult.filesModified || [],
      ...pagesResult.filesModified || []
    ],
    iterationResults
  };
}

// ============================================================================
// TASK DEFINITIONS
// ============================================================================

export const designSystemSetupTask = defineTask('design-system-setup', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Setup Design System Foundation',
  description: 'Update Tailwind config, CSS variables, and font imports',

  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'senior frontend engineer specializing in design systems',
      task: 'Update the design system foundation to match the new UI design',
      context: {
        theme: args.theme,
        projectPath: '/home/hagaybar/projects/Fetch_Alma_Analytics_Reports',
        files: [
          'frontend/src/index.css',
          'frontend/tailwind.config.js',
          'frontend/index.html'
        ]
      },
      instructions: [
        'Update frontend/index.html to include Inter font from Google Fonts and Material Icons Round',
        'Update frontend/tailwind.config.js with primary color #4F46E5, extend borderRadius to 12px',
        'Update frontend/src/index.css with CSS variables for the design system colors',
        'Ensure the design system supports the light theme only',
        'Add custom scrollbar styles matching the design',
        'Return list of files modified'
      ],
      outputFormat: 'JSON with filesModified (array of file paths), summary (string)'
    },
    outputSchema: {
      type: 'object',
      required: ['filesModified', 'summary'],
      properties: {
        filesModified: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },

  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const layoutComponentsTask = defineTask('layout-components', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Update Layout Components',
  description: 'Redesign Sidebar, MainLayout, and Header components',

  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'senior frontend engineer',
      task: 'Redesign the layout components to match the design examples',
      context: {
        projectPath: '/home/hagaybar/projects/Fetch_Alma_Analytics_Reports',
        designReference: {
          sidebar: 'Fixed w-64, white background, border-right, logo section with icon, navigation with active state border-right indicator, theme toggle at bottom',
          header: 'Page title (text-3xl font-bold), subtitle, action buttons on right (Refresh outline, New Task primary)',
          mainLayout: 'Sidebar + main content area with proper padding (p-8)'
        },
        files: [
          'frontend/src/components/layout/Sidebar.tsx',
          'frontend/src/components/layout/MainLayout.tsx',
          'frontend/src/components/layout/Header.tsx'
        ]
      },
      instructions: [
        'Read the HTML examples at new_ui_examples/main_screen_example_code.html for exact styling',
        'Update Sidebar.tsx: Add Material Icons, logo with icon in primary color rounded-lg box, nav items with active state (border-right-4, bg-primary/10), remove theme toggle (light mode only)',
        'Update MainLayout.tsx: Ensure proper layout with fixed sidebar and scrollable main content',
        'Update Header.tsx: Match the design with title, subtitle, refresh and primary action buttons',
        'Use Tailwind classes matching the design examples',
        'Return list of files modified'
      ],
      outputFormat: 'JSON with filesModified (array of file paths), summary (string)'
    },
    outputSchema: {
      type: 'object',
      required: ['filesModified', 'summary'],
      properties: {
        filesModified: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },

  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const uiComponentsTask = defineTask('ui-components', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Update UI Components',
  description: 'Redesign Button, Card, Modal, Input, Select, Badge',

  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'senior frontend engineer',
      task: 'Redesign the UI primitive components to match the design examples',
      context: {
        projectPath: '/home/hagaybar/projects/Fetch_Alma_Analytics_Reports',
        designReference: {
          button: 'Primary: bg-primary text-white rounded-xl py-2.5 shadow-lg shadow-indigo-500/20, Secondary: border border-slate-200 rounded-xl',
          card: 'bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl transition-shadow',
          modal: 'Centered with backdrop blur, rounded-2xl, header with title and close button, scrollable content, sticky footer with actions',
          input: 'bg-gray-50 border-gray-200 rounded-lg px-4 py-2.5 focus:ring-primary',
          select: 'Same as input styling',
          badge: 'Daily=emerald, Weekly=blue, Monthly=amber, text-xs px-2 py-0.5 rounded-full'
        },
        files: [
          'frontend/src/components/ui/Button.tsx',
          'frontend/src/components/ui/Card.tsx',
          'frontend/src/components/ui/Modal.tsx',
          'frontend/src/components/ui/Input.tsx',
          'frontend/src/components/ui/Select.tsx',
          'frontend/src/components/ui/Badge.tsx'
        ]
      },
      instructions: [
        'Read the HTML examples for exact styling reference',
        'Update each component to match the new design system',
        'Ensure proper TypeScript types are maintained',
        'Use Tailwind classes consistently',
        'Return list of files modified'
      ],
      outputFormat: 'JSON with filesModified (array of file paths), summary (string)'
    },
    outputSchema: {
      type: 'object',
      required: ['filesModified', 'summary'],
      properties: {
        filesModified: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },

  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const featureComponentsTask = defineTask('feature-components', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Update Feature Components',
  description: 'Redesign TaskCard, TaskForm, TaskList',

  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'senior frontend engineer',
      task: 'Redesign the task-related feature components to match the design examples exactly',
      context: {
        projectPath: '/home/hagaybar/projects/Fetch_Alma_Analytics_Reports',
        designReference: {
          taskCard: 'White card with icon in indigo-50 box, title, frequency badge (colored by frequency), format badge, output/path/limit info rows, Run Task primary button, Test outline button, hover shows edit/delete icons',
          taskForm: 'Modal with sections: Basic Info (icon, title, inputs), Output Settings (grid layout), Testing & Debugging (blue background section), footer with Delete Task link, Cancel, Save Changes buttons',
          taskList: 'Grid with 2 columns on xl screens, gap-6'
        },
        files: [
          'frontend/src/components/tasks/TaskCard.tsx',
          'frontend/src/components/tasks/TaskForm.tsx',
          'frontend/src/components/tasks/TaskList.tsx'
        ],
        htmlExamples: [
          'new_ui_examples/main_screen_example_code.html',
          'new_ui_examples/edit_box_example_code.html'
        ]
      },
      instructions: [
        'Read the HTML examples CAREFULLY for exact styling',
        'TaskCard: Match the card design with icon, badges, info rows, and action buttons. Use Material Icons',
        'TaskForm: Create sectioned modal with Basic Info, Output Settings, Testing & Debugging sections. Each section has icon header',
        'TaskList: Update grid layout to match design',
        'Ensure all existing functionality is preserved',
        'Return list of files modified'
      ],
      outputFormat: 'JSON with filesModified (array of file paths), summary (string)'
    },
    outputSchema: {
      type: 'object',
      required: ['filesModified', 'summary'],
      properties: {
        filesModified: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },

  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const pagesTask = defineTask('pages', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Update Pages',
  description: 'Update TasksPage, Dashboard, LogsPage styling',

  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'senior frontend engineer',
      task: 'Update the page components to use the redesigned components properly',
      context: {
        projectPath: '/home/hagaybar/projects/Fetch_Alma_Analytics_Reports',
        files: [
          'frontend/src/pages/TasksPage.tsx',
          'frontend/src/pages/Dashboard.tsx',
          'frontend/src/pages/LogsPage.tsx'
        ]
      },
      instructions: [
        'Update TasksPage to match the design with proper header usage',
        'Update Dashboard with similar styling approach',
        'Update LogsPage to be consistent',
        'Ensure proper spacing and layout',
        'Return list of files modified'
      ],
      outputFormat: 'JSON with filesModified (array of file paths), summary (string)'
    },
    outputSchema: {
      type: 'object',
      required: ['filesModified', 'summary'],
      properties: {
        filesModified: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },

  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const visualVerificationTask = defineTask('visual-verification', (args, taskCtx) => ({
  kind: 'agent',
  title: `Visual Verification (Iteration ${args.iteration})`,
  description: 'Verify visual appearance using browser',

  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'QA engineer specializing in visual testing',
      task: 'Verify the UI matches the design examples by launching the app and taking screenshots',
      context: {
        projectPath: '/home/hagaybar/projects/Fetch_Alma_Analytics_Reports',
        checkPoints: args.checkPoints
      },
      instructions: [
        'Start the frontend dev server if not running (npm run dev in frontend/)',
        'Use Playwright browser tools to navigate to http://localhost:5173',
        'Take screenshots of: main tasks page, sidebar, a task card hover state',
        'Compare visually to the design examples in new_ui_examples/',
        'Note any discrepancies in colors, spacing, fonts, icons',
        'Return verification results with issues found'
      ],
      outputFormat: 'JSON with passed (boolean), issues (array of strings), screenshots (array of paths)'
    },
    outputSchema: {
      type: 'object',
      required: ['passed', 'issues'],
      properties: {
        passed: { type: 'boolean' },
        issues: { type: 'array', items: { type: 'string' } },
        screenshots: { type: 'array', items: { type: 'string' } }
      }
    }
  },

  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const buildCheckTask = defineTask('build-check', (args, taskCtx) => ({
  kind: 'shell',
  title: 'Build Check',
  description: 'Verify the frontend builds without errors',

  shell: {
    command: 'cd /home/hagaybar/projects/Fetch_Alma_Analytics_Reports/frontend && npm run build',
    timeout: 120000
  },

  io: {
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const qualityScoringTask = defineTask('quality-scoring', (args, taskCtx) => ({
  kind: 'agent',
  title: `Quality Scoring (Iteration ${args.iteration})`,
  description: 'Score the UI quality against design examples',

  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'senior UX engineer and design QA specialist',
      task: 'Score the UI redesign quality against the target design',
      context: {
        targetQuality: args.targetQuality,
        visualTestResult: args.visualTestResult,
        buildResult: args.buildResult,
        iteration: args.iteration
      },
      instructions: [
        'Evaluate visual fidelity to design examples (40%)',
        'Evaluate build success and no TypeScript errors (20%)',
        'Evaluate consistency across components (20%)',
        'Evaluate proper responsiveness (10%)',
        'Evaluate code quality (10%)',
        'Calculate overall score 0-100',
        'List specific issues and recommendations'
      ],
      outputFormat: 'JSON with overallScore (number), issues (array), recommendations (array), breakdown (object)'
    },
    outputSchema: {
      type: 'object',
      required: ['overallScore', 'issues', 'recommendations'],
      properties: {
        overallScore: { type: 'number', minimum: 0, maximum: 100 },
        issues: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'string' } },
        breakdown: { type: 'object' }
      }
    }
  },

  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const refinementTask = defineTask('refinement', (args, taskCtx) => ({
  kind: 'agent',
  title: `Refinement (Iteration ${args.iteration})`,
  description: 'Fix issues identified in quality scoring',

  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'senior frontend engineer',
      task: 'Fix the identified issues from quality scoring',
      context: {
        projectPath: '/home/hagaybar/projects/Fetch_Alma_Analytics_Reports',
        issues: args.issues,
        recommendations: args.recommendations,
        iteration: args.iteration
      },
      instructions: [
        'Address each issue identified in the feedback',
        'Apply the recommendations',
        'Ensure changes maintain existing functionality',
        'Return list of files modified and changes made'
      ],
      outputFormat: 'JSON with filesModified (array), changesMade (array of strings)'
    },
    outputSchema: {
      type: 'object',
      required: ['filesModified', 'changesMade'],
      properties: {
        filesModified: { type: 'array', items: { type: 'string' } },
        changesMade: { type: 'array', items: { type: 'string' } }
      }
    }
  },

  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));
