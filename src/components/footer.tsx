export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-6 md:px-8 md:py-4 bg-background border-t">
      <div className="container flex flex-col items-center justify-center gap-2 text-center md:flex-row md:justify-between">
        <p className="text-balance text-sm leading-loose text-muted-foreground">
          Copyright © {currentYear} | School of Computing - SRM Institute of Science &amp; Technology | All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
