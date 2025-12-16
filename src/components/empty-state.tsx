import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: string; // Emoji or icon
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 art-deco-border bg-card/30 backdrop-blur-sm art-deco-glow">
      {icon && (
        <div className="mb-4">
          <div className="text-6xl mb-4 filter drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]">
            {icon}
          </div>
        </div>
      )}

      <h3 className="text-lg font-semibold text-foreground mb-2 art-deco-text art-deco-shadow">
        {title}
      </h3>

      {description && (
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}

      {action && (
        <Button
          onClick={action.onClick}
          size="lg"
          className="art-deco-border bg-primary text-primary-foreground hover:bg-primary/90 art-deco-glow"
        >
          {action.label}
        </Button>
      )}

      {children}
    </div>
  );
}
