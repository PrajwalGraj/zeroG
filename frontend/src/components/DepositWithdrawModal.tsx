"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface DepositWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "deposit" | "withdraw";
  onSubmit: (amount: number) => Promise<void>;
}

export const DepositWithdrawModal = ({
  isOpen,
  onClose,
  mode,
  onSubmit,
}: DepositWithdrawModalProps) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(amountNum);
      setAmount("");
      onClose();
    } catch (error) {
      // Error is handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {mode === "deposit" ? "Deposit APT" : "Withdraw APT"}
          </DialogTitle>
          <DialogDescription>
            {mode === "deposit" 
              ? "Enter the amount of APT you want to deposit into the vault."
              : "Enter the amount of APT you want to withdraw from the vault."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (APT)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
                className="text-lg"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Minimum: 0.01 APT
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !amount || Number(amount) <= 0}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                mode === "deposit" ? "Deposit" : "Withdraw"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
