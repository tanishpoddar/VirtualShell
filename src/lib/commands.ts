'use client';
import { VirtualFileSystem } from './filesystem';
import { VFS, VFSDirectory, VFSNode, VFSFile } from './types';
import { format } from 'date-fns';

type CommandRunner = (
  args: string[],
  vfs: VirtualFileSystem,
  stdin: string
) => Promise<{ stdout: string; stderr: string }>;

const commands: Record<string, CommandRunner> = {
  echo: async (args, vfs, stdin) => {
    return { stdout: args.join(' '), stderr: '' };
  },
  date: async (args, vfs, stdin) => {
    return { stdout: new Date().toString(), stderr: '' };
  },
  cal: async (args, vfs, stdin) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let output = `   ${firstDay.toLocaleString('default', { month: 'long' })} ${year}\n`;
    output += 'Su Mo Tu We Th Fr Sa\n';

    let day = 1;
    let calendar = '';

    for (let i = 0; i < firstDay.getDay(); i++) {
        calendar += '   ';
    }

    while (day <= lastDay.getDate()) {
        calendar += day.toString().padStart(2, ' ') + ' ';
        if ((firstDay.getDay() + day - 1) % 7 === 6) {
            calendar += '\n';
        }
        day++;
    }
    return { stdout: output + calendar, stderr: '' };
  },
  pwd: async (args, vfs) => ({ stdout: vfs.cwd, stderr: '' }),
  ls: async (args, vfs) => {
    const showHidden = args.includes('-a');
    const longFormat = args.includes('-l');
    const pathArg = args.find(arg => !arg.startsWith('-')) || '.';
    
    try {
      const targetNode = vfs.getNode(pathArg);
      if (targetNode.type !== 'directory') {
        return { stdout: '', stderr: `ls: cannot access '${pathArg}': Not a directory` };
      }
      const children = Object.keys(targetNode.children);
      let outputLines = [];

      for (const name of children) {
        if (!showHidden && name.startsWith('.')) continue;
        const childNode = targetNode.children[name];
        if (longFormat) {
          const perms = (childNode.type === 'directory' ? 'd' : '-') + 
                        vfs.permissionsToString(childNode.permissions);
          const date = format(new Date(childNode.modified), 'MMM dd HH:mm');
          const size = childNode.type === 'file' ? childNode.content.length : 4096;
          outputLines.push(`${perms} 1 ${childNode.owner} ${childNode.group} ${String(size).padStart(5)} ${date} ${name}`);
        } else {
          outputLines.push(name);
        }
      }
      return { stdout: longFormat ? outputLines.join('\n') : outputLines.join('  '), stderr: '' };
    } catch(e: any) {
      return { stdout: '', stderr: e.message };
    }
  },
  cd: async (args, vfs) => {
    const targetPath = args[0] || '/home/student';
    try {
      vfs.cd(targetPath);
      return { stdout: '', stderr: '' };
    } catch (e: any) {
      return { stdout: '', stderr: e.message };
    }
  },
  mkdir: async (args, vfs) => {
    const path = args[0];
    if (!path) return { stdout: '', stderr: 'mkdir: missing operand' };
    try {
      vfs.mkdir(path);
      return { stdout: '', stderr: '' };
    } catch (e: any) {
      return { stdout: '', stderr: e.message };
    }
  },
  touch: async (args, vfs) => {
    const path = args[0];
    if (!path) return { stdout: '', stderr: 'touch: missing file operand' };
    try {
      vfs.touch(path);
      return { stdout: '', stderr: '' };
    } catch(e: any) {
      return { stdout: '', stderr: e.message };
    }
  },
  cat: async (args, vfs, stdin) => {
    if (args.length === 0) {
      return { stdout: stdin, stderr: '' };
    }
    const path = args[0];
    try {
      const content = vfs.cat(path);
      return { stdout: content, stderr: '' };
    } catch (e: any) {
      return { stdout: '', stderr: e.message };
    }
  },
  wc: async (args, vfs, stdin) => {
    let content = stdin;
    if (args[0]) {
      try {
        content = vfs.cat(args[0]);
      } catch (e: any) {
        return { stdout: '', stderr: e.message };
      }
    }
    const lines = content.split('\n').length - 1;
    const words = content.trim().split(/\s+/).length;
    const chars = content.length;
    return { stdout: `${lines} ${words} ${chars}`, stderr: '' };
  },
  grep: async (args, vfs, stdin) => {
    const pattern = args[0];
    if (!pattern) return { stdout: '', stderr: 'grep: missing pattern' };
    
    let content = stdin;
    if (args[1]) {
      try {
        content = vfs.cat(args[1]);
      } catch (e: any) {
        return { stdout: '', stderr: e.message };
      }
    }
    
    const regex = new RegExp(pattern);
    const matchingLines = content.split('\n').filter(line => regex.test(line));
    return { stdout: matchingLines.join('\n'), stderr: '' };
  },
  sort: async(args, vfs, stdin) => {
    let content = stdin;
    if (args[0]) {
       try {
        content = vfs.cat(args[0]);
      } catch (e: any) {
        return { stdout: '', stderr: e.message };
      }
    }
    return { stdout: content.split('\n').sort().join('\n'), stderr: '' };
  },
   rm: async (args, vfs) => {
    const path = args[0];
    if (!path) return { stdout: '', stderr: 'rm: missing operand' };
    try {
      vfs.rm(path);
      return { stdout: '', stderr: '' };
    } catch(e: any) {
      return { stdout: '', stderr: e.message };
    }
  },
  help: async () => {
    const availableCommands = Object.keys(commands).sort().join(', ');
    return { stdout: `SRM Virtual Shell\nAvailable commands: ${availableCommands}`, stderr: '' };
  }
};

const parseCommand = (commandLine: string) => {
  const parts = commandLine.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
  return parts.map(part => part.replace(/^["']|["']$/g, ''));
};

const executePipedCommands = async (
  segments: { command: string; args: string[]; redirections: any[] }[],
  vfs: VirtualFileSystem
) => {
  let stdin = '';
  let finalStdout = '';
  let finalStderr = '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const runner = commands[segment.command];
    if (!runner) {
      finalStderr += `srm-shell: command not found: ${segment.command}\n`;
      break;
    }
    const { stdout, stderr } = await runner(segment.args, vfs, stdin);

    if (stderr) {
      finalStderr += stderr;
      break; 
    }
    
    stdin = stdout;
    if (i === segments.length - 1) {
      finalStdout = stdout;
    }
  }

  return { stdout: finalStdout, stderr: finalStderr, vfs };
};

export const executeCommand = async (commandLine: string, vfsInstance: VirtualFileSystem) => {
  if (!commandLine.trim()) {
    return { stdout: '', stderr: '', vfs: vfsInstance };
  }
  
  const vfs = new VirtualFileSystem(vfsInstance.serialize());

  // Naive pipe parsing
  const pipeParts = commandLine.split('|').map(s => s.trim());
  
  const segments = [];
  let redirectionError = '';

  for(const part of pipeParts) {
    let commandStr = part;
    const redirections: {type: string, target: string}[] = [];

    const redirMatch = part.match(/(>>?|<)\s*(\S+)/);
    if(redirMatch) {
      commandStr = part.replace(redirMatch[0], '').trim();
      redirections.push({ type: redirMatch[1], target: redirMatch[2] });
    }

    const [command, ...args] = parseCommand(commandStr);
    segments.push({ command, args, redirections });
  }

  const finalSegment = segments[segments.length - 1];
  const outRedirection = finalSegment.redirections.find(r => r.type === '>' || r.type === '>>');

  const { stdout, stderr, vfs: updatedVfs } = await executePipedCommands(segments, vfs);

  if (outRedirection) {
    try {
      updatedVfs.writeFile(outRedirection.target, stdout, outRedirection.type === '>>');
      return { stdout: '', stderr, vfs: updatedVfs };
    } catch (e: any) {
      return { stdout: '', stderr: e.message, vfs: vfsInstance }; // return original vfs on error
    }
  }

  return { stdout, stderr, vfs: updatedVfs };
};
