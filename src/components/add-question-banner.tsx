"use client";

import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface AddQuestionBannerProps {
  onClick: () => void;
}

export function AddQuestionBanner({ onClick }: AddQuestionBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="w-full mb-8"
    >
      <Card
        className="relative w-full art-deco-border p-5 border-2 border-dashed bg-card/30 backdrop-blur-sm hover:border-primary hover:art-deco-glow transition-all duration-200 cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center justify-center gap-4">
          <div className="rounded-full p-3 bg-primary/10 border border-primary/30">
            <Plus className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground art-deco-text text-sm">
              Add a Question
            </h3>
            <p className="text-sm text-muted-foreground">
              Create your own question for the room
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
