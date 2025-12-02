import { Heart, Code } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-6 sm:py-8 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-t-2 border-primary/20">
      <div className="container max-w-screen-2xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          {/* Left side - Copyright */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground order-2 md:order-1">
            <Code className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            <span className="text-center md:text-left">
              © {currentYear} <span className="font-semibold text-foreground">OS Virtual Labs</span>
            </span>
          </div>

          {/* Center - Institution */}
          <div className="text-center order-1 md:order-2">
            <p className="text-sm sm:text-base font-medium text-foreground">
              School of Computing
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              SRM Institute of Science & Technology
            </p>
          </div>

          {/* Right side - Made with love */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground order-3">
            <span>Made with</span>
            <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 fill-red-500 animate-pulse flex-shrink-0" />
            <span>for students</span>
          </div>
        </div>

        {/* Bottom text */}
        <div className="mt-4 sm:mt-6 pt-4 border-t border-border/50 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground px-4">
            All Rights Reserved | Empowering the next generation of developers
          </p>
        </div>
      </div>
    </footer>
  );
}
