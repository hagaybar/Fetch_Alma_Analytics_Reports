/**
 * @process fix-sidebar-overflow
 * @description Fix sidebar overflow issue with visual verification
 * @inputs { }
 * @outputs { success: boolean, verified: boolean }
 */

import { defineTask } from '@a5c-ai/babysitter-sdk';

// Task: Fix the sidebar overflow issue
const fixOverflowTask = defineTask('fix-overflow', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Fix sidebar overflow in MainLayout',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend developer',
      task: 'Fix the sidebar overflow issue where the fixed sidebar covers the main content',
      context: {
        problem: 'The sidebar is fixed position with w-64 (256px) but main content is not properly offset, causing left portion of cards to be hidden',
        targetFile: 'frontend/src/components/layout/MainLayout.tsx',
        sidebarFile: 'frontend/src/components/layout/Sidebar.tsx'
      },
      instructions: [
        'Read MainLayout.tsx and Sidebar.tsx to understand the current structure',
        'The sidebar uses: fixed left-0 top-0 w-64 (256px width)',
        'Fix MainLayout so the main content area starts AFTER the sidebar',
        'Use margin-left: 256px or equivalent Tailwind class on the content wrapper',
        'Make sure the fix works by checking the CSS is correct',
        'Edit the MainLayout.tsx file with the fix',
        'Return confirmation of the change'
      ],
      outputFormat: 'JSON'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'change'],
      properties: {
        success: { type: 'boolean' },
        change: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

// Task: Visual verification using browser
const verifyVisualTask = defineTask('verify-visual', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Verify fix visually in browser',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'QA engineer with browser testing expertise',
      task: 'Verify the sidebar no longer covers the main content using browser tools',
      context: {
        devServerUrl: 'http://localhost:5174',
        previousFix: args.fixResult
      },
      instructions: [
        'Use Playwright MCP tools to navigate to http://localhost:5174',
        'Take a snapshot of the page to see the current layout',
        'Navigate to the Tasks page (/tasks) to verify task cards are fully visible',
        'Check that NO content is hidden behind the sidebar',
        'The first stats card (Total Tasks) should be fully visible',
        'Task cards should show complete text, not cut off on the left',
        'Take a screenshot as evidence',
        'Return verification result'
      ],
      outputFormat: 'JSON'
    },
    outputSchema: {
      type: 'object',
      required: ['verified', 'issue'],
      properties: {
        verified: { type: 'boolean' },
        issue: { type: 'string' },
        screenshotPath: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

// Main process
export async function process(inputs, ctx) {
  // Step 1: Fix the overflow issue
  ctx.log('Step 1: Fixing sidebar overflow...');
  const fixResult = await ctx.task(fixOverflowTask, {});

  // Step 2: Visual verification
  ctx.log('Step 2: Verifying fix visually...');
  const verifyResult = await ctx.task(verifyVisualTask, { fixResult: fixResult.value });

  // If not verified, we need a refinement loop
  if (!verifyResult.value?.verified) {
    // Breakpoint to ask user what to do
    await ctx.breakpoint({
      question: `Visual verification failed: ${verifyResult.value?.issue}. Should we try another approach?`,
      title: 'Fix Not Verified'
    });
  }

  return {
    success: fixResult.value?.success && verifyResult.value?.verified,
    fixApplied: fixResult.value,
    verification: verifyResult.value
  };
}
