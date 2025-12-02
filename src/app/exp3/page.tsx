
'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { Home as HomeIcon, Menu } from 'lucide-react';
import SrmLogo from '@/components/srm-logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const experimentSections = {
  aim: 'Aim',
  procedure: 'Procedure',
  ifStatement: 'If Statement',
  caseStructure: 'Case Structure',
  forLoop: 'For & While Loops',
  printf: 'Printf & Operators',
};

const experimentContent: Record<string, React.ReactNode> = {
  aim: (
    <div>
      <h3 className="text-xl font-bold mb-2 font-headline">Aim:</h3>
      <p>To execute shell programs in linux environment</p>
    </div>
  ),
  procedure: (
    <div>
      <h4 className="font-bold">How to run a Shell Script</h4>
      <ul className="list-disc list-inside space-y-1">
        <li>Edit and save your program using editor</li>
        <li>Add execute permission by chmod command</li>
        <li>Run your program using the name of your program: <code>./program-name</code></li>
      </ul>
      <h4 className="font-bold mt-4">Important Hints</h4>
      <ul className="list-disc list-inside space-y-1">
        <li>No space before and after the assignment operator Ex. <code>sum=0</code></li>
        <li>Single quote ignores all special characters. Dollar sign, Back quote and Back slash are not ignored inside Double quote. Back quote is used as command substitution. Back slash is used to remove the special meaning of a character.</li>
        <li>Arithmetic expression can be written as follows : <code>i=$((i+1))</code> or <code>i=$(expr $i + 1)</code></li>
        <li>Command line arguments are referred inside the programme as <code>$1, $2,</code> ..and so on</li>
        <li><code>$*</code> represents all arguments, <code>$#</code> specifies the number of arguments</li>
        <li><code>read</code> statement is used to get input from input device. Ex. <code>read a b</code></li>
      </ul>
    </div>
  ),
  ifStatement: (
    <div>
        <h4 className="font-bold">1. Syntax for if statement</h4>
        <h5 className="font-semibold mt-2">Syntax-01:</h5>
        <pre className="bg-muted p-2 rounded-md my-2"><code>{`if [ condition ]
then
  #commands to execute if condition is true
fi`}</code></pre>
        <p>Example:</p>
        <pre className="bg-muted p-2 rounded-md my-2"><code>{`if [ $age -ge 18 ]
then
  echo "You are eligible to vote."
fi`}</code></pre>

        <h5 className="font-semibold mt-4">Syntax-02:</h5>
        <pre className="bg-muted p-2 rounded-md my-2"><code>{`if [ condition ]
then
  # commands if condition is true
else
  # commands if condition is false
fi`}</code></pre>
        <p>Example:</p>
        <pre className="bg-muted p-2 rounded-md my-2"><code>{`if [ $num -eq 0 ]
then
  echo "Zero"
else
  echo "Non-zero"
fi`}</code></pre>

        <h5 className="font-semibold mt-4">Syntax-03:</h5>
        <pre className="bg-muted p-2 rounded-md my-2"><code>{`if [ condition1 ]
then
  # commands for condition1
elif [ condition2 ]
then
  # commands for condition2
else
  # commands if no conditions are true
fi`}</code></pre>
        <p>Example:</p>
        <pre className="bg-muted p-2 rounded-md my-2"><code>{`if [ $marks -ge 90 ]
then
  echo "Grade A"
elif [ $marks -ge 75 ]
then
  echo "Grade B"
else
  echo "Grade C"
fi`}</code></pre>
    </div>
  ),
  caseStructure: (
    <div>
        <h4 className="font-bold">2. Syntax for case structure</h4>
        <pre className="bg-muted p-2 rounded-md my-2"><code>{`case expression in
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
        <p>Example:</p>
        <pre className="bg-muted p-2 rounded-md my-2"><code>{`echo "Enter a number between 1 and 3:"
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
     <div>
        <h4 className="font-bold">3. Syntax for for-loop</h4>
        <pre className="bg-muted p-2 rounded-md my-2"><code>{`for var in value1 value2 value3
do
  # commands using $var
done`}</code></pre>
        <p>Example:</p>
        <pre className="bg-muted p-2 rounded-md my-2"><code>{`for color in red green blue
do
  echo "Color is $color"
done`}</code></pre>
      <h4 className="font-bold mt-4">Syntax for While loop</h4>
      <pre className="bg-muted p-2 rounded-md my-2"><code>{`while [ condition ]
do
  # commands to execute while condition is true
done`}</code></pre>
        <p>Example:</p>
        <pre className="bg-muted p-2 rounded-md my-2"><code>{`count=1
while [ $count -le 5 ]
do
  echo "Count is $count"
  count=$((count + 1))
done`}</code></pre>
     </div>
  ),
  printf: (
    <div>
      <h4 className="font-bold">4. Syntax for printf statement</h4>
      <pre className="bg-muted p-2 rounded-md my-2"><code>{`printf "format-string" [arguments...]`}</code></pre>
      <ul className="list-disc list-inside space-y-1 mt-2">
        <li>Break and continue statements functions similar to C programming</li>
        <li>Relational operators are <code>–lt, -le, -gt, -ge, -eq,-ne</code><br/>Example: (i>= 10) is written as <code>[ $i -ge 10 ]</code></li>
        <li>Logical operators (and, or, not) are <code>-a, -o, !</code><br/>Example: (a>b) && (a>c) is written as <code>[ $a –gt $b –a $a –gt $c ]</code></li>
        <li>Two strings can be compared using <code>=</code> operator</li>
      </ul>
    </div>
  ),
};

export default function Experiment3Page() {
  const [activeSection, setActiveSection] = useState('aim');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderNavLinks = (isSheet = false) => (
    <ul className='space-y-1'>
      {Object.entries(experimentSections).map(([key, title]) => (
        <li key={key}>
           <Button
              variant={activeSection === key ? 'secondary' : 'ghost'}
              className="w-full justify-start text-left h-auto py-2 px-3 transition-colors duration-200"
              onClick={() => {
                setActiveSection(key)
                if (isSheet) setIsMenuOpen(false);
              }}
            >
            {title}
            </Button>
        </li>
      ))}
    </ul>
  );


  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-4">
             <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200">
                <HomeIcon className="h-5 w-5" />
             </Link>
            <div className="h-6 w-px bg-border" />
            <SrmLogo className="h-8 w-8" />
            <div className='hidden md:block'>
                <h1 className="font-extrabold font-headline text-xl tracking-tight">OS Virtual Labs</h1>
                <p className="text-sm text-muted-foreground">Experiment 3: Shell Programs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                    <div className='p-4'>
                      <h2 className="text-lg font-semibold mb-4">Experiment Sections</h2>
                      {renderNavLinks(true)}
                    </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      <div className="flex-grow grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 container mx-auto p-4 md:p-6">
          <nav className="hidden md:block md:col-span-1 lg:col-span-1">
              <Card className="sticky top-20 animate-fade-in-left">
                  <CardHeader>
                      <CardTitle className="text-lg">Experiment Sections</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    {renderNavLinks()}
                  </CardContent>
              </Card>
          </nav>
          <main className="md:col-span-3 lg:col-span-4 flex flex-col gap-6">
             <AnimatePresence mode="wait">
                <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="flex flex-col gap-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-headline">{experimentSections[activeSection as keyof typeof experimentSections]}</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-blue max-w-none dark:prose-invert">
                            {experimentContent[activeSection as keyof typeof experimentContent]}
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>
          </main>
      </div>
    </div>
  );
}
