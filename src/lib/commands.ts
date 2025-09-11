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
    
    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
      return { stdout: '', stderr: 'cal: invalid date' };
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
    return { stdout: output + calendar.trimEnd(), stderr: '' };
  },
  passwd: async () => ({ stdout: 'passwd: password updated successfully (simulated)', stderr: '' }),
  pwd: async (args, vfs) => ({ stdout: vfs.cwd, stderr: '' }),
  ls: async (args, vfs) => {
    const showHidden = args.includes('-a');
    const longFormat = args.includes('-l');
    let pathArg = args.find(arg => !arg.startsWith('-')) || '.';
    
    // Rudimentary globbing for substitution examples
    let childrenNames;
    const targetNode = vfs.getNode(vfs.resolvePath(pathArg, true));

    if (targetNode.type !== 'directory') {
        return { stdout: '', stderr: `ls: cannot access '${pathArg}': Not a directory` };
    }
    
    const globPattern = args.find(arg => !arg.startsWith('-'));
    if (globPattern && (globPattern.includes('*') || globPattern.includes('?') || globPattern.includes('['))) {
      const allChildren = Object.keys(targetNode.children);
      const regex = new RegExp('^' + globPattern.replace(/\*/g, '.*').replace(/\?/g, '.').replace(/\[/g, '[').replace(/\]/g, ']') + '$');
      childrenNames = allChildren.filter(name => regex.test(name));
      pathArg = '.'; // files are in current dir
    } else {
      childrenNames = Object.keys(targetNode.children);
    }

    try {
      let outputLines = [];

      for (const name of childrenNames) {
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
    // This is a simplified simulation and does not handle creating new files via `cat > file` interactively.
    // The user must provide the file content via piping, e.g., `echo "hello" | cat > f1`
    // Or redirection will be handled by the executeCommand function.
    if (args.length > 0 && (args[0] === ">" || args[0] === ">>")) {
      return { stdout: '', stderr: `srm-shell: Use redirection operators with commands: 'echo "content" > ${args[1]}'` };
    }

    if (args.length === 0) {
      return { stdout: stdin, stderr: '' };
    }

    let output = '';
    let error = '';

    for (const path of args) {
        try {
            const content = vfs.cat(path);
            output += content;
        } catch (e: any) {
            error += e.message + '\n';
        }
    }
    return { stdout: output, stderr: error.trim() };
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
      const nStr = args.find(arg => arg.startsWith('-'));
      const n = nStr ? parseInt(nStr.substring(1), 10) : 10;
      const path = args.find(arg => !arg.startsWith('-'));
      
      if (isNaN(n)) return { stdout: '', stderr: `head: invalid number of lines: ${nStr}`};

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
      const nStr = args.find(arg => arg.startsWith('-'));
      const n = nStr ? parseInt(nStr.substring(1), 10) : 10;
      const path = args.find(arg => !arg.startsWith('-'));

      if (isNaN(n)) return { stdout: '', stderr: `tail: invalid number of lines: ${nStr}`};

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
    const hasFlags = args.some(arg => arg.startsWith('-'));
    let showLines = args.includes('-l');
    let showWords = args.includes('-w');
    let showChars = args.includes('-c');
    if (!hasFlags) {
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

    if (!content && !path) {
      return { stdout: '      0       0       0', stderr: '' };
    }

    const lines = (content.match(/\n/g) || (content.endsWith('\n') || content === '' ? [] : [''])).length;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;
    
    let output = '';
    if (showLines) output += String(lines).padStart(7) + ' ';
    if (showWords) output += String(words).padStart(7) + ' ';
    if (showChars) output += String(chars).padStart(7) + ' ';
    if (path) output += path;

    return { stdout: output.trim(), stderr: '' };
  },
  grep: async (args, vfs, stdin) => {
    const pattern = args[0];
    if (!pattern) return { stdout: '', stderr: 'grep: missing pattern' };
    
    let content = stdin;
    const filePath = args.slice(1).find(arg => arg !== pattern);
    if (filePath) {
      try {
        content = vfs.cat(filePath);
      } catch (e: any) {
        return { stdout: '', stderr: e.message };
      }
    }
    
    try {
        const regex = new RegExp(pattern);
        const matchingLines = content.split('\n').filter(line => regex.test(line));
        return { stdout: matchingLines.join('\n'), stderr: '' };
    } catch (e: any) {
        return { stdout: '', stderr: `grep: invalid pattern: ${pattern}` };
    }
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
        
        const dmp = new (await import('diff-match-patch')).diff_match_patch();
        const diff = dmp.diff_main(file1, file2);
        dmp.diff_cleanupSemantic(diff);

        let output = '';
        const lines1 = file1.split('\n');
        const lines2 = file2.split('\n');
        let lineNum1 = 0;
        let lineNum2 = 0;

        for (const [op, text] of diff) {
            const numLines = text.split('\n').length - 1;
            if (op === dmp.DIFF_DELETE) {
                output += `${lineNum1 + 1},${lineNum1 + numLines}d${lineNum2}\n`;
                text.split('\n').slice(0, -1).forEach(line => output += `< ${line}\n`);
                lineNum1 += numLines;
            } else if (op === dmp.DIFF_INSERT) {
                output += `${lineNum1}a${lineNum2 + 1},${lineNum2 + numLines}\n`;
                text.split('\n').slice(0, -1).forEach(line => output += `> ${line}\n`);
                lineNum2 += numLines;
            } else {
                 lineNum1 += numLines;
                 lineNum2 += numLines;
            }
        }
        
        if (!output) return { stdout: '', stderr: '' };

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
    const realRunner = commands[command];
    if (realRunner) {
        return await realRunner(args.slice(1), vfs, '');
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
  'apt-get': async (args: string[]) => ({ stdout: `Simulating apt-get ${args.join(' ')}... Done.\nThis is a simulation. Package management is not available.`, stderr: '' }),
  'adduser': async (args: string[]) => ({ stdout: `Simulating adduser ${args[0]}... Done.\nThis is a simulation. User management is not available.`, stderr: '' }),
  'passwd': async (args: string[]) => ({ stdout: `Simulating passwd for ${args.length > 0 ? args[0] : 'current user'}... Done.\nThis is a simulation. User management is not available.`, stderr: '' }),
  'userdel': async (args: string[]) => ({ stdout: `Simulating userdel ${args.length > 0 ? args[0] : ''}... Done.\nThis is a simulation. User management is not available.`, stderr: '' }),
  'addgroup': async (args: string[]) => ({ stdout: `Simulating addgroup ${args[0]}... Done.\nThis is a simulation. Group management is not available.`, stderr: '' }),
  'delgroup': async (args: string[]) => ({ stdout: `Simulating delgroup ${args[0]}... Done.\nThis is a simulation. Group management is not available.`, stderr: '' }),
  'chage': async (args: string[]) => ({ stdout: `Simulating chage for ${args.length > 0 ? args[0] : ''}... Done.\nThis is a simulation. User management is not available.`, stderr: '' }),
  'apt': async(args: string[]) => ({ stdout: `Simulating apt ${args.join(' ')}... Done.\nThis is a simulation. Package management is not available.`, stderr: '' }),
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
    
    let currentStdin = stdin;
    const inRedirection = segment.redirections.find(r => r.type === '<');
    if (inRedirection) {
        try {
            currentStdin = vfs.cat(inRedirection.target);
        } catch (e: any) {
            finalStderr += e.message;
            break;
        }
    }
    
    const { stdout, stderr } = await runner(segment.args, vfs, currentStdin);

    if (stderr) {
      finalStderr += stderr;
      break; 
    }
    
    stdin = stdout; // The output of this command becomes the input for the next
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

  const pipeParts = commandLine.split('|').map(s => s.trim());
  const segments = [];

  for(const part of pipeParts) {
    let commandStr = part;
    const redirections: {type: string, target: string}[] = [];

    // This regex is simple and handles one redirection per command part.
    // A more robust solution would be needed for multiple redirections.
    const redirMatches = commandStr.matchAll(/(>>?|<)\s*(\S+)/g);
    for (const match of redirMatches) {
        commandStr = commandStr.replace(match[0], '').trim();
        redirections.push({ type: match[1], target: match[2] });
    }
    
    const [command, ...args] = parseCommand(commandStr);
    if(command) {
        segments.push({ command, args, redirections });
    }
  }

  if (segments.length === 0) {
     return { stdout: '', stderr: '', vfs: vfsInstance };
  }

  // Handle output redirection only for the last command in the pipeline
  const lastSegment = segments[segments.length - 1];
  const outRedirection = lastSegment.redirections.find(r => r.type === '>' || r.type === '>>');

  const { stdout, stderr, vfs: updatedVfs } = await executePipedCommands(segments, vfs);

  if (outRedirection) {
    if (stderr) { // If there was an error during piped execution, don't write to file
        return { stdout: '', stderr, vfs: vfsInstance };
    }
    try {
      updatedVfs.writeFile(outRedirection.target, stdout + '\n', outRedirection.type === '>>');
      return { stdout: '', stderr: '', vfs: updatedVfs };
    } catch (e: any) {
      return { stdout: '', stderr: e.message, vfs: vfsInstance };
    }
  }

  return { stdout, stderr, vfs: updatedVfs };
};

    