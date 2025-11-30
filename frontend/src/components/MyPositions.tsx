"use client";

import { Wallet, TrendingUp, Coins } from "lucide-react";

interface MyPositionsProps {
  totalValue?: number;
  totalYield?: number;
  activePositions?: number;
  isConnected?: boolean;
}

export const MyPositions = ({
  totalValue = 0,
  totalYield = 0,
  activePositions = 0,
  isConnected = false,
}: MyPositionsProps) => {
  if (!isConnected) {
    return (
      <div className="p-6 rounded-2xl border-2 border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-muted border-2 border-border">
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">My Positions</h3>
        </div>
        <p className="text-muted-foreground text-sm">
          Connect your wallet to view your positions and balances.
        </p>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Value",
      value: `$${totalValue.toLocaleString()}`,
      icon: Wallet,
      color: "text-primary",
    },
    {
      label: "Total Yield",
      value: `+$${totalYield.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      label: "Active Positions",
      value: activePositions.toString(),
      icon: Coins,
      color: "text-foreground",
    },
  ];

  return (
    <div className="p-6 rounded-2xl border-2 border-border bg-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10 border-2 border-border">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-semibold text-lg">My Positions</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted border-2 border-border">
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
