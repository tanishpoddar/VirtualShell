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
    let year = now.getFullYear();
    let month = now.getMonth();

    if (args.length === 1) {
      year = parseInt(args[0], 10);
    } else if (args.length === 2) {
      month = parseInt(args[0], 10) - 1;
      year = parseInt(args[1], 10);
    }
    
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
  passwd: async () => ({ stdout: 'passwd: password updated successfully (simulated)', stderr: '' }),
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
                        vfs.permissionsToString((childNode.permissions >> 6) & 7) +
                        vfs.permissionsToString((childNode.permissions >> 3) & 7) +
                        vfs.permissionsToString(childNode.permissions & 7);
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
  rmdir: async(args, vfs) => {
    const path = args[0];
    if (!path) return { stdout: '', stderr: 'rmdir: missing operand' };
    try {
      vfs.rmdir(path);
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
    if (args.length > 0 && args[0] === ">") {
        const path = args[1];
        if(!path) return { stdout: '', stderr: 'cat: missing file operand' };
        try {
            // This is a simplified version, doesn't handle interactive input
            vfs.writeFile(path, stdin, false);
            return { stdout: '', stderr: '' };
        } catch (e: any) {
            return { stdout: '', stderr: e.message };
        }
    }
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
  cp: async (args, vfs) => {
    if (args.length !== 2) return { stdout: '', stderr: 'cp: missing file operand' };
    const [sourcePath, destPath] = args;
    try {
      vfs.cp(sourcePath, destPath);
      return { stdout: '', stderr: '' };
    } catch(e: any) {
      return { stdout: '', stderr: e.message };
    }
  },
  mv: async (args, vfs) => {
    if (args.length !== 2) return { stdout: '', stderr: 'mv: missing file operand' };
    const [sourcePath, destPath] = args;
    try {
      vfs.mv(sourcePath, destPath);
      return { stdout: '', stderr: '' };
    } catch(e: any) {
      return { stdout: '', stderr: e.message };
    }
  },
  head: async (args, vfs, stdin) => {
      const n = (args[0] && parseInt(args[0].substring(1))) || 10;
      const path = args.find(arg => !arg.startsWith('-'));
      let content = stdin;
      if (path) {
          try {
              content = vfs.cat(path);
          } catch(e: any) { return { stdout: '', stderr: e.message } }
      }
      const lines = content.split('\n');
      return { stdout: lines.slice(0, n).join('\n'), stderr: '' };
  },
  tail: async (args, vfs, stdin) => {
      const n = (args[0] && parseInt(args[0].substring(1))) || 10;
      const path = args.find(arg => !arg.startsWith('-'));
      let content = stdin;
      if (path) {
          try {
              content = vfs.cat(path);
          } catch(e: any) { return { stdout: '', stderr: e.message } }
      }
      const lines = content.split('\n');
      return { stdout: lines.slice(-n).join('\n'), stderr: '' };
  },
  wc: async (args, vfs, stdin) => {
    let showLines = args.includes('-l');
    let showWords = args.includes('-w');
    let showChars = args.includes('-c');
    if (!showLines && !showWords && !showChars) {
      showLines = showWords = showChars = true;
    }
    
    const path = args.find(arg => !arg.startsWith('-'));
    let content = stdin;
    if (path) {
      try {
        content = vfs.cat(path);
      } catch (e: any) {
        return { stdout: '', stderr: e.message };
      }
    }
    const lines = (content.match(/\n/g) || []).length;
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const chars = content.length;
    
    let output = '';
    if (showLines) output += `${lines} `;
    if (showWords) output += `${words} `;
    if (showChars) output += `${chars} `;
    if (path) output += path;

    return { stdout: output.trim(), stderr: '' };
  },
  grep: async (args, vfs, stdin) => {
    const pattern = args[0];
    if (!pattern) return { stdout: '', stderr: 'grep: missing pattern' };
    
    let content = stdin;
    const filePath = args.find(arg => !arg.startsWith(pattern));
    if (filePath) {
      try {
        content = vfs.cat(filePath);
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
    const path = args.find(arg => !arg.startsWith('-'));
    if (path) {
       try {
        content = vfs.cat(path);
      } catch (e: any) {
        return { stdout: '', stderr: e.message };
      }
    }
    return { stdout: content.split('\n').sort().join('\n'), stderr: '' };
  },
  uniq: async(args, vfs, stdin) => {
    let content = stdin;
    const path = args.find(arg => !arg.startsWith('-'));
    if (path) {
       try {
        content = vfs.cat(path);
      } catch (e: any) {
        return { stdout: '', stderr: e.message };
      }
    }
    const lines = content.split('\n');
    const uniqueLines = lines.filter((line, index) => line !== lines[index-1]);
    return { stdout: uniqueLines.join('\n'), stderr: '' };
  },
  diff: async(args, vfs, stdin) => {
      if(args.length !== 2) return { stdout: '', stderr: 'diff: requires two file arguments' };
      try {
        const file1 = vfs.cat(args[0]);
        const file2 = vfs.cat(args[1]);
        const lines1 = file1.split('\n');
        const lines2 = file2.split('\n');
        let output = '';
        lines1.forEach((line, i) => {
            if (line !== lines2[i]) {
                output += `< ${line}\n> ${lines2[i]}\n`;
            }
        });
        return { stdout: output, stderr: '' };
      } catch(e: any) {
          return { stdout: '', stderr: e.message };
      }
  },
  chmod: async(args, vfs) => {
    if(args.length !== 2) return { stdout: '', stderr: 'chmod: missing operands' };
    try {
        vfs.chmod(args[1], args[0]);
        return { stdout: '', stderr: '' };
    } catch (e: any) {
        return { stdout: '', stderr: e.message };
    }
  },
  cut: async(args, vfs, stdin) => {
      return { stdout: '', stderr: 'cut: command not fully implemented yet' };
  },
  sudo: async(args, vfs) => {
    const command = args[0];
    const runner = adminCommands[command];
    if (runner) {
      return await runner(args.slice(1), vfs);
    }
    return { stdout: '', stderr: `sudo: ${command}: command not found`};
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
  who: async() => ({ stdout: 'student', stderr: '' }),
  help: async () => {
    const availableCommands = Object.keys(commands).sort().join(', ');
    return { stdout: `SRM Virtual Shell\nAvailable commands: ${availableCommands}`, stderr: '' };
  }
};

const adminCommands: Record<string, (args: string[], vfs: VirtualFileSystem) => Promise<{ stdout: string; stderr: string }>> = {
  'apt-get': async (args: string[]) => ({ stdout: `Simulating apt-get ${args.join(' ')}... Done.`, stderr: '' }),
  adduser: async (args: string[]) => ({ stdout: `Simulating adduser ${args[0]}... Done.`, stderr: '' }),
  passwd: async (args: string[]) => ({ stdout: `Simulating passwd for ${args[1]}... Done.`, stderr: '' }),
  userdel: async (args: string[]) => ({ stdout: `Simulating userdel ${args[1]}... Done.`, stderr: '' }),
  addgroup: async (args: string[]) => ({ stdout: `Simulating addgroup ${args[0]}... Done.`, stderr: '' }),
  delgroup: async (args: string[]) => ({ stdout: `Simulating delgroup ${args[0]}... Done.`, stderr: '' }),
  chage: async (args: string[]) => ({ stdout: `Simulating chage for ${args[1]}... Done.`, stderr: '' }),
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

    