import { cn } from "@/lib/utils";

export default function SrmLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={cn("h-10 w-10 text-primary", className)}
      {...props}
    >
      <g fill="currentColor">
        <path d="M50,5A45,45,0,1,1,5,50,45,45,0,0,1,50,5m0-5a50,50,0,1,0,50,50A50,50,0,0,0,50,0h0Z" />
        <path d="M30,30h40v10h-40Z" />
        <path d="M30,45h10v35h-10Z" />
        <path d="M60,45h10v35h-10Z" />
        <path d="M45,45h10v10h-10Z" />
        <path d="M45,60h10v10h-10Z" />
      </g>
    </svg>
  );
}
