import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const commands = {
  basic: [
    { cmd: 'echo [text]', desc: 'Display a line of text.' },
    { cmd: 'clear', desc: 'Clear the terminal screen.' },
    { cmd: 'date', desc: 'Display the current date and time.' },
    { cmd: 'cal', desc: 'Display a calendar.' },
    { cmd: 'pwd', desc: 'Print name of current/working directory.' },
  ],
  fileManagement: [
    { cmd: 'ls [-la]', desc: 'List directory contents.' },
    { cmd: 'cat [file]', desc: 'Concatenate and display files.' },
    { cmd: 'cp [src] [dest]', desc: 'Copy files and directories.' },
    { cmd: 'mv [src] [dest]', desc: 'Move or rename files.' },
    { cmd: 'rm [file]', desc: 'Remove files or directories.' },
    { cmd: 'head [file]', desc: 'Output the first part of files.' },
    { cmd: 'tail [file]', desc: 'Output the last part of files.' },
  ],
  directoryManagement: [
    { cmd: 'mkdir [dir]', desc: 'Make directories.' },
    { cmd: 'cd [dir]', desc: 'Change the shell working directory.' },
    { cmd: 'rmdir [dir]', desc: 'Remove empty directories.' },
  ],
  filters: [
    { cmd: 'grep [pattern] [file]', desc: 'Print lines matching a pattern.' },
    { cmd: 'sort [file]', desc: 'Sort lines of text files.' },
    { cmd: 'wc [file]', desc: 'Print newline, word, and byte counts.' },
  ],
  advanced: [
    { cmd: 'chmod [mode] [file]', desc: 'Change file mode bits.' },
    { cmd: 'command > file', desc: 'Redirect output to a file.' },
    { cmd: 'command | another', desc: 'Pipe output to another command.' },
  ],
};

export default function InstructionsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Instructions & Commands</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="basic">
            <AccordionTrigger>Basic Commands</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2">
                {commands.basic.map((c, i) => (
                  <li key={i}>
                    <p className="font-code text-sm text-primary">{c.cmd}</p>
                    <p className="text-xs text-muted-foreground">{c.desc}</p>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="file">
            <AccordionTrigger>File Management</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2">
                {commands.fileManagement.map((c, i) => (
                  <li key={i}>
                    <p className="font-code text-sm text-primary">{c.cmd}</p>
                    <p className="text-xs text-muted-foreground">{c.desc}</p>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="dir">
            <AccordionTrigger>Directory Management</AccordionTrigger>
            <AccordionContent>
               <ul className="space-y-2">
                {commands.directoryManagement.map((c, i) => (
                  <li key={i}>
                    <p className="font-code text-sm text-primary">{c.cmd}</p>
                    <p className="text-xs text-muted-foreground">{c.desc}</p>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
           <AccordionItem value="filters">
            <AccordionTrigger>Filters</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2">
                {commands.filters.map((c, i) => (
                  <li key={i}>
                    <p className="font-code text-sm text-primary">{c.cmd}</p>
                    <p className="text-xs text-muted-foreground">{c.desc}</p>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="advanced">
            <AccordionTrigger>Advanced Usage</AccordionTrigger>
            <AccordionContent>
               <ul className="space-y-2">
                {commands.advanced.map((c, i) => (
                  <li key={i}>
                    <p className="font-code text-sm text-primary">{c.cmd}</p>
                    <p className="text-xs text-muted-foreground">{c.desc}</p>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
