"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  ChevronUp,
  Search,
  ArrowUpDown,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export interface Pool {
  id: string;
  pair: string;
  token1: string;
  token2: string;
  tvl: number;
  volume24h: number;
  utilization: number;
  apr: number;
  type: "stable" | "concentrated" | "metastable";
  feeTier: number;
  score?: number;
}

const tokenLogos: Record<string, string> = {
  USDC: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  USDT: "https://cryptologos.cc/logos/tether-usdt-logo.png",
  ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  SOL: "https://cryptologos.cc/logos/solana-sol-logo.png",
  BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
  WBTC: "https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png",
  APT: "https://cryptologos.cc/logos/aptos-apt-logo.png",
  AVAX: "https://cryptologos.cc/logos/avalanche-avax-logo.png",
  DAI: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png",
  MATIC: "https://cryptologos.cc/logos/polygon-matic-logo.png",
  LINK: "https://cryptologos.cc/logos/chainlink-link-logo.png",
  UNI: "https://cryptologos.cc/logos/uniswap-uni-logo.png",
  AAVE: "https://cryptologos.cc/logos/aave-aave-logo.png",
  CRV: "https://cryptologos.cc/logos/curve-dao-token-crv-logo.png",
  FRAX: "https://cryptologos.cc/logos/frax-frax-logo.png",
  thAPT: "https://cryptologos.cc/logos/aptos-apt-logo.png",
  RESERVE: "https://cryptologos.cc/logos/reserve-rights-rsr-logo.png",
  USD1: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  sUSDe: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  amAPT: "https://cryptologos.cc/logos/aptos-apt-logo.png",
  whUSDC: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  zUSDC: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
};

interface PoolsTableProps {
  pools: Pool[];
  isLoading?: boolean;
  onAddLiquidity?: (pool: Pool) => void;
  onViewPool?: (pool: Pool) => void;
}

type SortKey = "tvl" | "volume24h" | "apr" | "score";
type SortOrder = "asc" | "desc";

export const PoolsTable = ({
  pools,
  isLoading = false,
  onAddLiquidity,
  onViewPool,
}: PoolsTableProps) => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("tvl");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const filteredPools = pools
    .filter((pool) => {
      const matchesSearch = pool.pair.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || pool.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === "asc" ? 1 : -1;
      return (a[sortKey] - b[sortKey]) * multiplier;
    });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="rounded-2xl border-2 border-border bg-card/50 backdrop-blur-sm p-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-full border-2 border-border"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-full border-2 border-border">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="stable">Stable</SelectItem>
            <SelectItem value="concentrated">Concentrated</SelectItem>
            <SelectItem value="metastable">Metastable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border-2 border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-bold text-foreground">Pool</TableHead>
              <TableHead className="font-bold text-foreground">
                <button
                  onClick={() => handleSort("tvl")}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  TVL
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="font-bold text-foreground">
                <button
                  onClick={() => handleSort("volume24h")}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  24h Volume
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="font-bold text-foreground">Utilization</TableHead>
              <TableHead className="font-bold text-foreground">
                <button
                  onClick={() => handleSort("apr")}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  APR
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="font-bold text-foreground">
                <button
                  onClick={() => handleSort("score")}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  Risk Score
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPools.map((pool) => (
              <TableRow key={pool.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center -space-x-2">
                      {tokenLogos[pool.token1] && (
                        <div className="w-8 h-8 rounded-full bg-white border-2 border-border flex items-center justify-center z-10">
                          <img 
                            src={tokenLogos[pool.token1]} 
                            alt={pool.token1} 
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                      )}
                      {tokenLogos[pool.token2] && (
                        <div className="w-8 h-8 rounded-full bg-white border-2 border-border flex items-center justify-center">
                          <img 
                            src={tokenLogos[pool.token2]} 
                            alt={pool.token2} 
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold">{pool.pair}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border">
                          V{pool.type === "stable" ? "3" : pool.type === "concentrated" ? "3" : "1"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border">
                          {pool.type.charAt(0).toUpperCase() + pool.type.slice(1)}
                        </Badge>
                        <span>{(pool.feeTier * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-bold text-sm">{formatNumber(pool.tvl)}</TableCell>
                <TableCell className="font-bold text-sm">{formatNumber(pool.volume24h)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden border border-border">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${pool.utilization}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium min-w-[45px]">
                      {pool.utilization.toFixed(1)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {pool.apr > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`font-bold text-sm ${pool.apr > 100 ? 'text-purple-600' : pool.apr > 15 ? 'text-green-600' : pool.apr > 5 ? 'text-blue-600' : 'text-gray-600'}`}>
                      {pool.apr.toFixed(2)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {pool.score !== undefined ? (
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden border border-border">
                        <div
                          className={`h-full transition-all duration-300 ${
                            pool.score > 0.7 ? 'bg-red-500' :
                            pool.score > 0.4 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${pool.score * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold min-w-[45px] ${
                        pool.score > 0.7 ? 'text-red-600' :
                        pool.score > 0.4 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {(pool.score * 100).toFixed(1)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">N/A</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pool Count */}
      <div className="mt-4 text-sm text-muted-foreground text-center">
        Showing {filteredPools.length} pool{filteredPools.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};
