'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getCommandLineHints } from '@/ai/flows/contextual-command-line-hints';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Terminal, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CommandHintsProps {
    onRunHint: (command: string) => void;
}

export default function CommandHints({ onRunHint }: CommandHintsProps) {
  const [commandLine, setCommandLine] = useState('');
  const [hints, setHints] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGetHints = async () => {
    if (!commandLine.trim()) {
      setError('Please enter a command to get hints.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setHints([]);
    try {
      const result = await getCommandLineHints({ commandLine });
      setHints(result.hints);
    } catch (e) {
      setError('Failed to get hints. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: text,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="text-primary" />
          <span>AI Command Helper</span>
        </CardTitle>
        <CardDescription>
          Stuck? Type a command to get helpful hints and examples.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., ls -l or grep"
            value={commandLine}
            onChange={(e) => setCommandLine(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGetHints()}
            className="font-code"
          />
          <Button onClick={handleGetHints} disabled={isLoading}>
            {isLoading ? 'Getting Hints...' : 'Get Hints'}
          </Button>
        </div>
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {hints.length > 0 && (
          <div className="mt-4 space-y-2">
            {hints.map((hint, index) => (
              <div key={index} className="bg-secondary/50 p-3 rounded-md font-code text-sm flex justify-between items-center gap-2">
                <span>{hint}</span>
                <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyToClipboard(hint)}>
                        <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRunHint(hint)}>
                        <Terminal className="h-4 w-4" />
                    </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
