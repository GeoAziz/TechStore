'use server';
/**
 * @fileOverview Enhances product descriptions with AI-generated details, comparative stats, and compatibility information based on component selection.
 *
 * - enhanceProductInfo - A function that enhances product information.
 * - EnhanceProductInfoInput - The input type for the enhanceProductInfo function.
 * - EnhanceProductInfoOutput - The return type for the enhanceProductInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceProductInfoInputSchema = z.object({
  productDescription: z.string().describe('The original product description.'),
  selectedComponents: z
    .array(z.string())
    .describe('List of components selected by the user.'),
});
export type EnhanceProductInfoInput = z.infer<typeof EnhanceProductInfoInputSchema>;

const EnhanceProductInfoOutputSchema = z.object({
  enhancedDescription: z
    .string()
    .describe('The enhanced product description with added details.'),
  comparativeStats: z
    .string()
    .describe('Comparative statistics based on selected components.'),
  compatibilityInfo: z
    .string()
    .describe('Compatibility information with selected components.'),
});
export type EnhanceProductInfoOutput = z.infer<typeof EnhanceProductInfoOutputSchema>;

export async function enhanceProductInfo(
  input: EnhanceProductInfoInput
): Promise<EnhanceProductInfoOutput> {
  return enhanceProductInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceProductInfoPrompt',
  input: {schema: EnhanceProductInfoInputSchema},
  output: {schema: EnhanceProductInfoOutputSchema},
  prompt: `You are an AI assistant that enhances product descriptions with more details, comparative stats, and compatibility information based on the user's component selection.

Original Product Description: {{{productDescription}}}

Selected Components: {{#each selectedComponents}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Enhance the product description by adding more technical details, comparative stats based on selected components, and compatibility information with the selected components. Ensure the enhanced description is informative and helps the user make informed purchase decisions.

Output the enhanced description, comparative stats, and compatibility information in a structured format.

Enhanced Description:
Comparative Stats:
Compatibility Info: `,
});

const enhanceProductInfoFlow = ai.defineFlow(
  {
    name: 'enhanceProductInfoFlow',
    inputSchema: EnhanceProductInfoInputSchema,
    outputSchema: EnhanceProductInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
