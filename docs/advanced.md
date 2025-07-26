# Advanced AI Feature: PC Build Compatibility Checker

## 1. Objective

To create a Genkit flow that acts as an AI-powered compatibility checker for the PC Customizer page. This tool will analyze a user's selected components (CPU, Motherboard, RAM, GPU, etc.) and provide real-time feedback on their compatibility, performance synergy, and potential bottlenecks.

This will replace the current mock data and simple cost calculation with an intelligent, value-added feature that helps users build better PCs.

## 2. Genkit Flow Design (`src/ai/flows/check-build-compatibility.ts`)

### a. Input Schema (`CheckBuildInput`)

The flow will accept an object containing the names or IDs of the selected components.

```typescript
import { z } from 'zod';

export const CheckBuildInputSchema = z.object({
  cpu: z.string().describe("The selected CPU model name."),
  motherboard: z.string().describe("The selected motherboard model name."),
  ram: z.string().describe("The selected RAM kit (e.g., '16GB DDR5 6000MHz')."),
  gpu: z.string().describe("The selected Graphics Card model name."),
  storage: z.string().describe("The selected primary storage drive model name."),
  psu: z.string().describe("The selected Power Supply Unit model name."),
});

export type CheckBuildInput = z.infer<typeof CheckBuildInputSchema>;
```

### b. Output Schema (`CheckBuildOutput`)

The flow will return a structured object containing compatibility information, warnings, and performance analysis.

```typescript
import { z } from 'zod';

const CompatibilityIssueSchema = z.object({
  severity: z.enum(['Warning', 'Critical']),
  componentA: z.string(),
  componentB: z.string(),
  issue: z.string().describe("A detailed explanation of the compatibility issue."),
});

export const CheckBuildOutputSchema = z.object({
  isCompatible: z.boolean().describe("A simple true/false flag indicating if the build is viable."),
  issues: z.array(CompatibilityIssueSchema).describe("A list of all identified compatibility issues."),
  performanceSummary: z.string().describe("A brief, AI-generated summary of the expected performance profile (e.g., 'Excellent for 1440p gaming', 'A solid entry-level workstation')."),
  bottleneckAnalysis: z.string().describe("Identifies the primary bottleneck in the system (e.g., 'The GPU may be held back by the CPU in gaming workloads.')."),
  upgradeSuggestion: z.string().optional().describe("A suggestion for a single component upgrade to improve balance."),
});

export type CheckBuildOutput = z.infer<typeof CheckBuildOutputSchema>;
```

### c. Prompt Definition

The prompt will instruct the AI to act as an expert PC builder, analyzing the provided components for physical and performance compatibility.

```handlebars
You are an expert PC builder AI for Zizo_TechVerse. Your task is to analyze the user's selected components for compatibility and performance.

Analyze the following components:
- CPU: {{{cpu}}}
- Motherboard: {{{motherboard}}}
- RAM: {{{ram}}}
- GPU: {{{gpu}}}
- Storage: {{{storage}}}
- PSU: {{{psu}}}

Your analysis must cover the following:
1.  **Physical Compatibility**: Check for socket compatibility (CPU/Motherboard), RAM type (DDR4/DDR5), and form factor issues.
2.  **Performance Synergy**: Evaluate if the components are well-balanced. Identify any significant performance bottlenecks where one component severely limits another.
3.  **Power Requirements**: Ensure the PSU is sufficient for the combined load of the CPU and GPU under stress.

Based on your analysis, provide a clear, structured output. If there are any critical issues (e.g., CPU and motherboard sockets do not match), set `isCompatible` to `false`. For performance imbalances or minor issues, use a 'Warning' severity.
```

## 3. Frontend Integration (`src/app/customizer/page.tsx`)

The Customizer page will be updated to:
1.  Manage the state of selected components for each category.
2.  Include a "Check Compatibility" button that becomes active when all essential components are selected.
3.  Call the `checkBuildCompatibility` flow when the button is clicked, showing a loading state.
4.  Display the AI-generated results in a structured and visually appealing way, using icons and colors to highlight critical issues, warnings, and positive feedback.
5.  Allow the user to modify their selections and re-run the analysis.
