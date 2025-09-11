'use server';
/**
 * @fileOverview Provides context-aware command line hints to students.
 *
 * - getCommandLineHints - A function that generates command line hints based on the current input.
 * - CommandLineHintsInput - The input type for the getCommandLineHints function.
 * - CommandLineHintsOutput - The return type for the getCommandLineHints function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CommandLineHintsInputSchema = z.object({
  commandLine: z
    .string()
    .describe('The current command line input by the student.'),
});
export type CommandLineHintsInput = z.infer<typeof CommandLineHintsInputSchema>;

const CommandLineHintsOutputSchema = z.object({
  hints: z.array(z.string()).describe('An array of hints and usage examples.'),
});
export type CommandLineHintsOutput = z.infer<typeof CommandLineHintsOutputSchema>;

export async function getCommandLineHints(input: CommandLineHintsInput): Promise<CommandLineHintsOutput> {
  return commandLineHintsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'commandLineHintsPrompt',
  input: {schema: CommandLineHintsInputSchema},
  output: {schema: CommandLineHintsOutputSchema},
  prompt: `You are a helpful assistant for students learning Linux commands. Given the current command line input, provide a list of hints and usage examples to help the student learn the syntax and options more effectively.

Current command line input: {{{commandLine}}}

Hints and usage examples:`,
});

const commandLineHintsFlow = ai.defineFlow(
  {
    name: 'commandLineHintsFlow',
    inputSchema: CommandLineHintsInputSchema,
    outputSchema: CommandLineHintsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
