export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-6 md:px-8 md:py-4 bg-background border-t">
      <div className="container flex items-center justify-center">
        <p className="text-balance text-sm leading-loose text-muted-foreground text-center">
          Copyright © {currentYear} | School of Computing - SRM Institute of Science &amp; Technology | All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
