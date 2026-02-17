/**
 * @process ui-theme-redesign
 * @description Comprehensive UI redesign with Soft & Warm theme
 * @inputs { theme: string }
 * @outputs { success: boolean }
 */

import { defineTask } from '@a5c-ai/babysitter-sdk';

// Task 1: Update color palette and base styles
const updateThemeTask = defineTask('update-theme', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Update color palette to Soft & Warm theme',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior UI designer specializing in modern SaaS design',
      task: 'Update the CSS color palette and base styles for a Soft & Warm theme like Stripe',
      context: {
        targetFile: 'frontend/src/index.css',
        theme: 'Soft & Warm - warm neutrals, rounded corners, friendly feel'
      },
      instructions: [
        'Read the current index.css file',
        'Replace the color palette with warm, inviting colors:',
        '  - Primary: Warm indigo/purple (#6366f1 or similar)',
        '  - Background: Warm off-white (#fafaf9 or #f5f5f4)',
        '  - Card background: Pure white',
        '  - Text: Warm dark gray (#1c1917)',
        '  - Muted text: Warm medium gray (#78716c)',
        '  - Border: Soft warm gray (#e7e5e4)',
        '  - Accent: Warm amber/orange for highlights',
        'Add smooth transitions for hover states',
        'Increase base font size slightly for readability',
        'Edit the file with the new theme',
        'Return summary of changes'
      ],
      outputFormat: 'JSON'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: { success: { type: 'boolean' }, changes: { type: 'string' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

// Task 2: Redesign layout components with more whitespace
const redesignLayoutTask = defineTask('redesign-layout', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Redesign layout with more whitespace',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior UI designer',
      task: 'Redesign Sidebar and Header for a spacious, warm feel',
      context: {
        files: [
          'frontend/src/components/layout/Sidebar.tsx',
          'frontend/src/components/layout/Header.tsx'
        ]
      },
      instructions: [
        'Read Sidebar.tsx and Header.tsx',
        'Sidebar improvements:',
        '  - Simplify the design, remove footer section',
        '  - Use larger padding (px-4 -> px-5)',
        '  - Increase nav item padding (py-2.5 -> py-3)',
        '  - Use rounded-xl for nav items',
        '  - Softer shadow (remove harsh shadows)',
        '  - Remove the "NAVIGATION" label - keep it minimal',
        'Header improvements:',
        '  - Increase height from h-16 to h-18 or similar',
        '  - Larger title font (text-2xl)',
        '  - More padding',
        '  - Remove subtitle if exists',
        'Edit both files',
        'Return summary'
      ],
      outputFormat: 'JSON'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: { success: { type: 'boolean' }, changes: { type: 'string' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

// Task 3: Redesign cards for cleaner look
const redesignCardsTask = defineTask('redesign-cards', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Redesign cards for cleaner, spacious look',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior UI designer',
      task: 'Redesign Card and TaskCard components for a cleaner, more spacious look',
      context: {
        files: [
          'frontend/src/components/ui/Card.tsx',
          'frontend/src/components/tasks/TaskCard.tsx',
          'frontend/src/components/tasks/TaskList.tsx'
        ]
      },
      instructions: [
        'Read Card.tsx, TaskCard.tsx, and TaskList.tsx',
        'Card.tsx improvements:',
        '  - Use rounded-2xl for softer corners',
        '  - Softer shadow: shadow-sm with warm tint',
        '  - Add subtle border',
        '  - Increase default padding',
        'TaskCard.tsx improvements:',
        '  - Larger title (text-lg font-semibold)',
        '  - More spacing between elements',
        '  - Cleaner button layout - use gap-3',
        '  - Make Run button more prominent (larger, filled)',
        '  - Secondary buttons smaller and subtle',
        'TaskList.tsx improvements:',
        '  - Increase grid gap to gap-8',
        '  - Max 2 columns on large screens for larger cards',
        'Edit all files',
        'Return summary'
      ],
      outputFormat: 'JSON'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: { success: { type: 'boolean' }, changes: { type: 'string' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

// Task 4: Redesign pages for better spacing
const redesignPagesTask = defineTask('redesign-pages', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Redesign pages with more whitespace',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior UI designer',
      task: 'Update Dashboard and TasksPage for more whitespace and better typography',
      context: {
        files: [
          'frontend/src/pages/Dashboard.tsx',
          'frontend/src/pages/TasksPage.tsx'
        ]
      },
      instructions: [
        'Read Dashboard.tsx and TasksPage.tsx',
        'Dashboard improvements:',
        '  - Increase page padding to p-10',
        '  - Increase section margin to mb-12',
        '  - Stats grid: gap-8, max 4 columns',
        '  - Stat numbers: text-4xl font-bold',
        '  - Add section titles with proper hierarchy',
        'TasksPage improvements:',
        '  - Increase page padding to p-10',
        '  - Add a subtle description under the title',
        'Edit both files',
        'Return summary'
      ],
      outputFormat: 'JSON'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: { success: { type: 'boolean' }, changes: { type: 'string' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

// Task 5: Visual verification
const verifyTask = defineTask('verify-design', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Verify design looks good',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'QA engineer',
      task: 'Verify the new design compiles and looks professional',
      context: {},
      instructions: [
        'Run npm run build in frontend to check for errors',
        'Use Playwright to navigate to http://localhost:5174',
        'Take screenshots of Dashboard and Tasks pages',
        'Verify the design looks warm, spacious, and professional',
        'Return verification result'
      ],
      outputFormat: 'JSON'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: { success: { type: 'boolean' }, issues: { type: 'array' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

// Main process
export async function process(inputs, ctx) {
  ctx.log('Phase 1: Updating color theme...');
  const themeResult = await ctx.task(updateThemeTask, {});

  ctx.log('Phase 2: Redesigning layout components...');
  const layoutResult = await ctx.task(redesignLayoutTask, {});

  ctx.log('Phase 3: Redesigning cards...');
  const cardsResult = await ctx.task(redesignCardsTask, {});

  ctx.log('Phase 4: Redesigning pages...');
  const pagesResult = await ctx.task(redesignPagesTask, {});

  ctx.log('Phase 5: Verifying design...');
  const verifyResult = await ctx.task(verifyTask, {});

  // Final approval
  await ctx.breakpoint({
    question: 'Design update complete. Please review at http://localhost:5174 and approve.',
    title: 'Final Design Review'
  });

  return {
    success: verifyResult.value?.success,
    phases: { themeResult, layoutResult, cardsResult, pagesResult, verifyResult }
  };
}
