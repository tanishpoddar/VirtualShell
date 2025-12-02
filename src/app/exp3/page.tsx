'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { Home as HomeIcon, Menu, BookOpen, Code, Terminal as TerminalIcon } from 'lucide-react';
import SrmLogo from '@/components/srm-logo';
import AuthButton from '@/components/auth-button';
import WebContainerTerminal from '@/components/webcontainer-terminal/WebContainerTerminal';
import CommandHints from '@/components/command-hints';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const experimentSections = {
  aim: 'Aim',
  procedure: 'Procedure',
  ifStatement: 'If Statement',
  caseStructure: 'Case Structure',
  forLoop: 'For & While Loops',
  printf: 'Printf & Operators',
  terminal: 'Terminal',
};

const sectionIcons: Record<string, any> = {
  aim: BookOpen,
  procedure: Code,
  terminal: TerminalIcon,
};

const experimentContent: Record<string, React.ReactNode> = {
  aim: (
    <div>
      <h3 className="text-2xl font-bold mb-4 font-headline gradient-text">Aim:</h3>
      <p className="text-lg">To execute shell programs in linux environment</p>
    </div>
  ),
  procedure: (
    <div className="space-y-6">
      <div>
        <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm">1</span>
          How to run a Shell Script
        </h4>
        <ul className="list-none space-y-2 ml-10">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">▸</span>
            <span>Edit and save your program using editor</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">▸</span>
            <span>Add execute permission by chmod command</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">▸</span>
            <span>Run your program using the name of your program: <code className="px-2 py-1 bg-muted rounded text-primary">./program-name</code></span>
          </li>
        </ul>
      </div>
      
      <div>
        <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm">2</span>
          Important Hints
        </h4>
        <ul className="list-none space-y-2 ml-10">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">▸</span>
            <span>No space before and after the assignment operator Ex. <code className="px-2 py-1 bg-muted rounded text-green-600">sum=0</code></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">▸</span>
            <span>Single quote ignores all special characters. Dollar sign, Back quote and Back slash are not ignored inside Double quote.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">▸</span>
            <span>Arithmetic expression: <code className="px-2 py-1 bg-muted rounded text-green-600">i=$((i+1))</code> or <code className="px-2 py-1 bg-muted rounded text-green-600">i=$(expr $i + 1)</code></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">▸</span>
            <span>Command line arguments: <code className="px-2 py-1 bg-muted rounded text-green-600">$1, $2,</code> etc.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">▸</span>
            <span><code className="px-2 py-1 bg-muted rounded text-green-600">$*</code> represents all arguments, <code className="px-2 py-1 bg-muted rounded text-green-600">$#</code> specifies the number of arguments</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">▸</span>
            <span><code className="px-2 py-1 bg-muted rounded text-green-600">read</code> statement is used to get input. Ex. <code className="px-2 py-1 bg-muted rounded text-green-600">read a b</code></span>
          </li>
        </ul>
      </div>
    </div>
  ),
  ifStatement: (
    <div className="space-y-6">
      <h4 className="text-xl font-bold mb-4 gradient-text">1. Syntax for if statement</h4>
      
      <div className="space-y-4">
        <div>
          <h5 className="font-semibold mb-2 text-lg">Syntax-01: Simple If</h5>
          <pre className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200 overflow-x-auto"><code className="text-sm text-gray-800 font-semibold">{`if [ condition ]
then
  #commands to execute if condition is true
fi`}</code></pre>
          <p className="mt-2 text-muted-foreground">Example:</p>
          <pre className="bg-muted p-4 rounded-lg mt-2 border border-border overflow-x-auto"><code className="text-sm text-green-600 font-semibold">{`if [ $age -ge 18 ]
then
  echo "You are eligible to vote."
fi`}</code></pre>
        </div>

        <div>
          <h5 className="font-semibold mb-2 text-lg">Syntax-02: If-Else</h5>
          <pre className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200 overflow-x-auto"><code className="text-sm text-gray-800 font-semibold">{`if [ condition ]
then
  # commands if condition is true
else
  # commands if condition is false
fi`}</code></pre>
          <p className="mt-2 text-muted-foreground">Example:</p>
          <pre className="bg-muted p-4 rounded-lg mt-2 border border-border overflow-x-auto"><code className="text-sm text-green-600 font-semibold">{`if [ $num -eq 0 ]
then
  echo "Zero"
else
  echo "Non-zero"
fi`}</code></pre>
        </div>

        <div>
          <h5 className="font-semibold mb-2 text-lg">Syntax-03: If-Elif-Else</h5>
          <pre className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200 overflow-x-auto"><code className="text-sm text-gray-800 font-semibold">{`if [ condition1 ]
then
  # commands for condition1
elif [ condition2 ]
then
  # commands for condition2
else
  # commands if no conditions are true
fi`}</code></pre>
          <p className="mt-2 text-muted-foreground">Example:</p>
          <pre className="bg-muted p-4 rounded-lg mt-2 border border-border overflow-x-auto"><code className="text-sm text-green-600 font-semibold">{`if [ $marks -ge 90 ]
then
  echo "Grade A"
elif [ $marks -ge 75 ]
then
  echo "Grade B"
else
  echo "Grade C"
fi`}</code></pre>
        </div>
      </div>
    </div>
  ),
  caseStructure: (
    <div className="space-y-4">
      <h4 className="text-xl font-bold mb-4 gradient-text">2. Syntax for case structure</h4>
      <pre className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg border-2 border-orange-200 overflow-x-auto"><code className="text-sm text-gray-800 font-semibold">{`case expression in
pattern1)
  # commands to execute if expression matches pattern1
  ;;
pattern2)
  # commands to execute if expression matches pattern2
  ;;
*)
  # default commands (if no pattern matches)
  ;;
esac`}</code></pre>
      <p className="mt-4 text-muted-foreground font-semibold">Example:</p>
      <pre className="bg-muted p-4 rounded-lg border border-border overflow-x-auto"><code className="text-sm text-orange-600 font-semibold">{`echo "Enter a number between 1 and 3:"
read num
case $num in
1)
  echo "You selected One"
  ;;
2)
  echo "You selected Two"
  ;;
3)
  echo "You selected Three"
  ;;
*)
  echo "Invalid choice"
  ;;
esac`}</code></pre>
    </div>
  ),
  forLoop: (
    <div className="space-y-6">
      <div>
        <h4 className="text-xl font-bold mb-4 gradient-text">3. Syntax for for-loop</h4>
        <pre className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-lg border-2 border-cyan-200 overflow-x-auto"><code className="text-sm text-gray-800 font-semibold">{`for var in value1 value2 value3
do
  # commands using $var
done`}</code></pre>
        <p className="mt-4 text-muted-foreground font-semibold">Example:</p>
        <pre className="bg-muted p-4 rounded-lg border border-border overflow-x-auto"><code className="text-sm text-cyan-600 font-semibold">{`for color in red green blue
do
  echo "Color is $color"
done`}</code></pre>
      </div>
      
      <div>
        <h4 className="text-xl font-bold mb-4 gradient-text-green">Syntax for While loop</h4>
        <pre className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-lg border-2 border-green-200 overflow-x-auto"><code className="text-sm text-gray-800 font-semibold">{`while [ condition ]
do
  # commands to execute while condition is true
done`}</code></pre>
        <p className="mt-4 text-muted-foreground font-semibold">Example:</p>
        <pre className="bg-muted p-4 rounded-lg border border-border overflow-x-auto"><code className="text-sm text-green-600 font-semibold">{`count=1
while [ $count -le 5 ]
do
  echo "Count is $count"
  count=$((count + 1))
done`}</code></pre>
      </div>
    </div>
  ),
  printf: (
    <div className="space-y-4">
      <h4 className="text-xl font-bold mb-4 gradient-text">4. Syntax for printf statement</h4>
      <pre className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200 overflow-x-auto"><code className="text-sm text-gray-800 font-semibold">{`printf "format-string" [arguments...]`}</code></pre>
      
      <div className="mt-6 space-y-3">
        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="font-semibold text-blue-900">Break and continue statements</p>
          <p className="text-blue-700 text-sm">Functions similar to C programming</p>
        </div>
        
        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
          <p className="font-semibold text-green-900">Relational operators</p>
          <p className="text-green-700 text-sm"><code className="px-2 py-1 bg-white rounded">–lt, -le, -gt, -ge, -eq, -ne</code></p>
          <p className="text-green-700 text-sm mt-1">Example: (i{'>'}= 10) is written as <code className="px-2 py-1 bg-white rounded">[ $i -ge 10 ]</code></p>
        </div>
        
        <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded">
          <p className="font-semibold text-purple-900">Logical operators</p>
          <p className="text-purple-700 text-sm">and, or, not are <code className="px-2 py-1 bg-white rounded">-a, -o, !</code></p>
          <p className="text-purple-700 text-sm mt-1">Example: (a{'>'}b) && (a{'>'}c) is <code className="px-2 py-1 bg-white rounded">[ $a –gt $b –a $a –gt $c ]</code></p>
        </div>
        
        <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
          <p className="font-semibold text-orange-900">String comparison</p>
          <p className="text-orange-700 text-sm">Two strings can be compared using <code className="px-2 py-1 bg-white rounded">=</code> operator</p>
        </div>
      </div>
    </div>
  ),
};

export default function Experiment3Page() {
  const [activeSection, setActiveSection] = useState('aim');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleRunHint = (command: string) => {
    setActiveSection('terminal');
  };

  const renderNavLinks = (isSheet = false) => (
    <ul className='space-y-2'>
      {Object.entries(experimentSections).map(([key, title]) => {
        const Icon = sectionIcons[key];
        return (
          <li key={key}>
            <Button
              variant={activeSection === key ? 'default' : 'ghost'}
              className={`w-full justify-start text-left h-auto py-3 px-4 transition-all duration-200 ${
                activeSection === key 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700' 
                  : 'hover:bg-muted hover:text-foreground'
              }`}
              onClick={() => {
                setActiveSection(key);
                if (isSheet) setIsMenuOpen(false);
              }}
            >
              {Icon && <Icon className="h-4 w-4 mr-2" />}
              {title}
            </Button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b-2 border-primary/20 bg-white shadow-md">
        <div className="container flex h-14 sm:h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200 flex-shrink-0">
              <HomeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
            <div className="h-4 sm:h-6 w-px bg-border flex-shrink-0" />
            <SrmLogo className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
            <div className='hidden sm:block min-w-0'>
              <h1 className="font-extrabold font-headline text-sm md:text-base lg:text-xl tracking-tight gradient-text truncate">OS Virtual Labs</h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">Experiment 3: Shell Programs</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <AuthButton />
            <div className="lg:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                  <div className='p-4'>
                    <h2 className="text-base sm:text-lg font-semibold mb-4 gradient-text">Experiment Sections</h2>
                    {renderNavLinks(true)}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 container mx-auto p-4 sm:p-6">
        {/* Sidebar Navigation */}
        <nav className="hidden lg:block lg:col-span-1">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="sticky top-20 border-2 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg gradient-text">Experiment Sections</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                {renderNavLinks()}
              </CardContent>
            </Card>
          </motion.div>
        </nav>

        {/* Main Content Area */}
        <main className="lg:col-span-3 xl:col-span-4 flex flex-col gap-4 sm:gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex flex-col gap-6"
            >
              {activeSection !== 'terminal' ? (
                <Card className="border-2 shadow-lg card-hover">
                  <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6">
                    <CardTitle className="text-xl sm:text-2xl font-headline gradient-text">
                      {experimentSections[activeSection as keyof typeof experimentSections]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-blue max-w-none dark:prose-invert p-4 sm:p-6">
                    {experimentContent[activeSection as keyof typeof experimentContent]}
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="border-2 shadow-lg">
                    <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
                      <CardTitle className="flex items-center gap-2">
                        <TerminalIcon className="h-5 w-5 text-green-600" />
                        <span className="gradient-text-green">Terminal</span>
                      </CardTitle>
                      <CardDescription>
                        Real Linux terminal powered by WebContainers. Your filesystem is saved automatically when logged in.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      <WebContainerTerminal />
                    </CardContent>
                  </Card>
                  <CommandHints onRunHint={handleRunHint} />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
