/**
 * @process ui-redesign
 * @description Frontend UI Redesign - Professional dashboard style with quality convergence
 * @inputs { issues: string[], designDirection: string }
 * @outputs { success: boolean, phases: object }
 */

import { defineTask } from '@a5c-ai/babysitter-sdk';

// ============================================================================
// Task Definitions
// ============================================================================

// PHASE 1: Design Analysis and Planning
const analyzeCurrentUITask = defineTask('analyze-ui', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Analyze current UI issues',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior UX/UI designer and frontend architect',
      task: 'Analyze the current React frontend and identify specific issues causing the problems',
      context: {
        issues: args.issues,
        designDirection: args.designDirection,
        files: [
          'frontend/src/components/layout/Sidebar.tsx',
          'frontend/src/components/layout/MainLayout.tsx',
          'frontend/src/components/layout/Header.tsx',
          'frontend/src/pages/Dashboard.tsx',
          'frontend/src/pages/TasksPage.tsx',
          'frontend/src/components/tasks/TaskCard.tsx',
          'frontend/src/components/tasks/TaskList.tsx',
          'frontend/src/index.css'
        ]
      },
      instructions: [
        'Read and analyze all the specified frontend files',
        'Identify the root cause of the sidebar hiding reports (layout/overflow issues)',
        'Identify specific CSS/layout issues causing the dense appearance',
        'List concrete improvements needed for a professional dashboard look',
        'Consider spacing, typography, color usage, visual hierarchy',
        'Provide specific file-by-file recommendations'
      ],
      outputFormat: 'JSON'
    },
    outputSchema: {
      type: 'object',
      required: ['sidebarIssue', 'densityIssues', 'recommendations'],
      properties: {
        sidebarIssue: {
          type: 'object',
          properties: {
            rootCause: { type: 'string' },
            affectedFiles: { type: 'array', items: { type: 'string' } },
            fix: { type: 'string' }
          }
        },
        densityIssues: { type: 'array', items: { type: 'object' } },
        recommendations: { type: 'array', items: { type: 'object' } },
        colorPaletteUpdate: { type: 'object' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

// PHASE 2: Implementation - Fix Critical Sidebar Issue
const fixSidebarTask = defineTask('fix-sidebar', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Fix sidebar overflow issue',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend developer specializing in React and CSS layouts',
      task: 'Fix the sidebar layout issue that causes content to be hidden',
      context: {
        analysis: args.analysis,
        targetFiles: [
          'frontend/src/components/layout/Sidebar.tsx',
          'frontend/src/components/layout/MainLayout.tsx'
        ]
      },
      instructions: [
        'Read the current Sidebar.tsx and MainLayout.tsx files',
        'Fix the layout so content is never hidden by the sidebar',
        'Ensure proper scrolling behavior for both sidebar and main content',
        'Make the layout responsive and robust',
        'Edit the files with the fixes',
        'Return summary of changes made'
      ],
      outputFormat: 'JSON'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'changes'],
      properties: {
        success: { type: 'boolean' },
        changes: { type: 'array', items: { type: 'object' } }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

// PHASE 3: Redesign Core Components
const redesignLayoutTask = defineTask('redesign-layout', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Redesign layout with professional dashboard style',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior UI designer and React developer',
      task: 'Redesign the layout components for a professional dashboard look',
      context: {
        designDirection: 'Professional dashboard - data-focused, crisp typography, clear hierarchy, enterprise feel',
        recommendations: args.recommendations,
        targetFiles: [
          'frontend/src/components/layout/Header.tsx',
          'frontend/src/components/layout/Sidebar.tsx',
          'frontend/src/index.css'
        ]
      },
      instructions: [
        'Read current files and understand the structure',
        'Update index.css with improved color palette for professional look',
        'Redesign Header.tsx with better visual hierarchy',
        'Polish Sidebar.tsx with better spacing and professional styling',
        'Use consistent spacing scale (8px base)',
        'Add subtle shadows and borders for depth',
        'Improve typography with better font weights and sizes',
        'Edit all the files with the improvements',
        'Return summary of all changes'
      ],
      outputFormat: 'JSON'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'changes'],
      properties: {
        success: { type: 'boolean' },
        changes: { type: 'array', items: { type: 'object' } }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

const redesignCardsTask = defineTask('redesign-cards', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Redesign card components',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior UI designer and React developer',
      task: 'Redesign card components for spacious, professional look',
      context: {
        designDirection: 'Professional dashboard with clear visual hierarchy',
        targetFiles: [
          'frontend/src/components/ui/Card.tsx',
          'frontend/src/components/tasks/TaskCard.tsx',
          'frontend/src/components/tasks/TaskList.tsx'
        ]
      },
      instructions: [
        'Read the current card-related files',
        'Improve Card.tsx with better shadows, borders, hover states',
        'Redesign TaskCard.tsx with clearer layout and better button arrangement',
        'Update TaskList.tsx grid for better spacing between cards',
        'Reduce visual density by adjusting padding and margins',
        'Create clear visual hierarchy in task cards',
        'Edit all the files with improvements',
        'Return summary of changes'
      ],
      outputFormat: 'JSON'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'changes'],
      properties: {
        success: { type: 'boolean' },
        changes: { type: 'array', items: { type: 'object' } }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

const redesignPagesTask = defineTask('redesign-pages', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Redesign page layouts',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior UI designer and React developer',
      task: 'Redesign Dashboard and TasksPage for professional look',
      context: {
        designDirection: 'Professional dashboard with ample whitespace',
        targetFiles: [
          'frontend/src/pages/Dashboard.tsx',
          'frontend/src/pages/TasksPage.tsx'
        ]
      },
      instructions: [
        'Read the current page files',
        'Improve Dashboard.tsx with better stats card styling and spacing',
        'Update page padding and section margins for breathing room',
        'Add subtle section dividers or visual grouping where appropriate',
        'Ensure consistent spacing throughout',
        'Edit the files with improvements',
        'Return summary of changes'
      ],
      outputFormat: 'JSON'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'changes'],
      properties: {
        success: { type: 'boolean' },
        changes: { type: 'array', items: { type: 'object' } }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

// PHASE 4: Visual Verification
const verifyUITask = defineTask('verify-ui', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Verify UI changes work correctly',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'QA engineer and frontend developer',
      task: 'Verify the UI changes compile and look correct',
      context: {
        previousChanges: args.changes
      },
      instructions: [
        'Run npm run build in the frontend directory to check for compilation errors',
        'Start the dev server and use browser tools to capture the current state',
        'Verify the sidebar no longer hides content',
        'Check that the new design looks professional',
        'Look for any visual regressions or issues',
        'Return verification results'
      ],
      outputFormat: 'JSON'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'compiles', 'issues'],
      properties: {
        success: { type: 'boolean' },
        compiles: { type: 'boolean' },
        issues: { type: 'array', items: { type: 'string' } },
        improvements: { type: 'array', items: { type: 'string' } }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

// ============================================================================
// Main Process Function
// ============================================================================
export async function process(inputs, ctx) {
  const {
    issues = [
      'Left sidebar hides some reports',
      'UI is not inviting and looks dense'
    ],
    designDirection = 'Professional dashboard - data-focused, crisp typography, clear hierarchy, enterprise feel'
  } = inputs;

  // Phase 1: Analyze current UI
  ctx.log('Phase 1: Analyzing current UI issues...');
  const analysis = await ctx.task(analyzeCurrentUITask, { issues, designDirection });

  // Breakpoint: Review analysis
  await ctx.breakpoint({
    question: 'UI analysis complete. Review findings and approve to proceed with implementation?',
    title: 'UI Analysis Review',
    context: {
      runId: ctx.runId
    }
  });

  // Phase 2: Fix critical sidebar issue first
  ctx.log('Phase 2: Fixing sidebar layout issue...');
  const sidebarFix = await ctx.task(fixSidebarTask, { analysis: analysis.value });

  // Phase 3: Redesign components in parallel
  ctx.log('Phase 3: Redesigning UI components...');
  const [layoutResult, cardsResult, pagesResult] = await ctx.parallel.all([
    () => ctx.task(redesignLayoutTask, { recommendations: analysis.value?.recommendations }),
    () => ctx.task(redesignCardsTask, {}),
    () => ctx.task(redesignPagesTask, {})
  ]);

  // Phase 4: Verify changes
  ctx.log('Phase 4: Verifying UI changes...');
  const verification = await ctx.task(verifyUITask, {
    changes: {
      sidebar: sidebarFix.value,
      layout: layoutResult.value,
      cards: cardsResult.value,
      pages: pagesResult.value
    }
  });

  // Final approval
  await ctx.breakpoint({
    question: 'UI redesign complete. Please review the changes in the browser and approve if satisfied.',
    title: 'Final UI Approval',
    context: { runId: ctx.runId }
  });

  return {
    success: verification.value?.success ?? false,
    phases: {
      analysis: analysis.value,
      sidebarFix: sidebarFix.value,
      layoutRedesign: layoutResult.value,
      cardsRedesign: cardsResult.value,
      pagesRedesign: pagesResult.value,
      verification: verification.value
    }
  };
}
