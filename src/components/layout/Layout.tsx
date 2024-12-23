import { ReactNode } from "react";
import { StickyHeader } from "./StickyHeader";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <StickyHeader />
      <main className="container mx-auto px-11 py-8">{children}</main>
    </div>
  );
};

export default Layout;
