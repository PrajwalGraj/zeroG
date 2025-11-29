'use client';

import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import Link from "next/link";

export const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b-2 border-border bg-background">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold tracking-tight">ZeroG</div>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium hover:underline">
            Docs
          </a>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium hover:underline flex items-center gap-1"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
          <a href="#" className="text-sm font-medium hover:underline">
            Blog
          </a>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="border-2 shadow-sm"
          asChild
        >
          <Link href="/signin">Sign In</Link>
        </Button>
      </div>
    </nav>
  );
};
