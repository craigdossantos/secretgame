"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      duration={3000}
      toastOptions={{
        classNames: {
          toast:
            "art-deco-border bg-card/95 backdrop-blur-sm border-border shadow-lg",
          title: "text-foreground font-medium art-deco-text",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground art-deco-border",
          cancelButton: "bg-secondary text-secondary-foreground border-border",
          error: "bg-destructive/10 border-destructive/50 text-destructive",
          success: "bg-primary/10 border-primary/50 text-primary",
          warning: "bg-yellow-500/10 border-yellow-500/50 text-yellow-600",
          info: "bg-blue-500/10 border-blue-500/50 text-blue-600",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
