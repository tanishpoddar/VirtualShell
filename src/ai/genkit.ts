import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

let _ai: ReturnType<typeof genkit> | null = null;

// Lazy initialization to avoid SSR issues with localStorage
function getAI() {
  if (!_ai) {
    _ai = genkit({
      plugins: [googleAI()],
      model: 'googleai/gemini-2.5-flash',
    });
  }
  return _ai;
}

export const ai = getAI();
