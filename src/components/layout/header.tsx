import AuthButton from '@/components/auth-button';
import SrmLogo from '@/components/srm-logo';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface AppHeaderProps {
  onReset: () => void;
}

export default function AppHeader({ onReset }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <SrmLogo className="h-8 w-8 mr-2" />
          <span className="font-bold hidden sm:inline-block">
            SRM Virtual Shell
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center space-x-2">
            <h1 className="text-sm sm:text-lg font-semibold text-center text-foreground/80 truncate">
                SRM OS Virtual Lab – Exp. 2: Basic Linux Commands & Filters
            </h1>
        </div>
        <div className="flex items-center justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={onReset}>
                <RotateCcw className="h-4 w-4 mr-2"/>
                Reset Lab
            </Button>
            <AuthButton />
        </div>
      </div>
    </header>
  );
}
