"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface RoomRenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  currentName: string;
  onRename: (newName: string) => void;
}

export function RoomRenameModal({
  isOpen,
  onClose,
  roomId,
  currentName,
  onRename,
}: RoomRenameModalProps) {
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename room");
      }

      const data = await response.json();
      onRename(data.room.name);
      toast.success("Room renamed successfully");
      onClose();
    } catch (error) {
      console.error("Failed to rename room:", error);
      toast.error("Failed to rename room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-center art-deco-text">
            Rename Room
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Room Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter room name"
              className="font-serif text-lg"
            />
          </div>

          <div className="p-3 bg-secondary/30 rounded-lg border border-primary/20">
            <p className="text-xs text-primary mb-1">Invite Link Preview</p>
            <p className="font-mono text-xs text-muted-foreground break-all">
              {typeof window !== "undefined" ? window.location.origin : ""}
              /invite/
              <span className="text-foreground font-bold">
                {name.trim().replace(/\s+/g, "-") || "..."}
              </span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !name.trim()}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
