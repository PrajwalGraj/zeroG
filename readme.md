# ZeroG

ZeroG is a next-generation DeFi platform built on the Aptos blockchain. It aggregates liquidity pools across multiple Aptos DEXs, scores pools using a multi-factor algorithm, and provides Move-based vaults for automated yield optimization. ZeroG also supports passwordless onboarding and gamified rewards through Photon.

---

## Quick Summary

- Multi-DEX pool aggregation (Thala, Liquidswap, Merkle Trade and more)
- Intelligent pool scoring engine (APR, TVL, volume, reputation, volatility)
- On-chain Move `Vault` contract for deposits, withdrawals and rebalancing
- Wallet-less, passwordless onboarding (Photon SDK + Google OAuth)
- Rewards and referral program (ZRG token future utility)
- Commercial data product (pay-per-use scoring API)

---

## Key Features

- Pool Aggregation: Collects and normalizes pool data from external APIs (GeckoTerminal, DEX APIs) and on-chain resources.
- Scoring Engine: Ranks pools using a deterministic formula that balances yield vs risk.
- Vaults: Move-based vault(s) that accept APT deposits, maintain per-user balances, and support admin withdrawals and rebalancing triggers.
- Gamification & Onboarding: Photon integration for passwordless login, auto-wallet creation, referrals and reward distribution.
- API Product: Exposes pool scores and analytics as a commercial API feed for institutions and integrators.

---

## Scoring Formula (summary)

The scoring engine computes a normalized score per pool using the following weighted formula:

score = (APR_normalized × 0.35) + (TVL_normalized × 0.20) + (Volume_normalized × 0.25) + (DEX_reputation × 0.10) - (Volatility_normalized × 0.15)

Where:
- APR is derived from fees = volume24h × feeRate; APR = (dailyFees × 365) / TVL. feeRate is chosen by pool type (stable vs volatile).
- Normalization maps each metric to 0–1 using normalize(value, min, max) = (value - min)/(max - min).
- DEX reputation: hand-picked scores (e.g. thala 0.9, liquidswap 0.85, merkle 0.8).

This balances expected yield (APR) with liquidity, activity and risk.

---

## Architecture & Tech Stack

- Frontend: Next.js (v15), React + TypeScript, Tailwind CSS, shadcn/ui, Radix UI
- Wallets: Petra, Aptos Wallet Adapter
- Backend: Node.js, Express.js, PostgreSQL (pg), Axios
- Blockchain: Aptos SDK (aptos@1.x), Move smart contracts
- On-chain contract: `zerog::Vault` deployed to Aptos testnet
- Gamification/Auth: Photon SDK + Google OAuth (passwordless)

---

## External APIs & Data Sources

- GeckoTerminal API — pool TVL, volume, price changes
- Thala / Liquidswap / Merkle APIs — DEX pool & market data
- Aptos fullnode RPC — on-chain resources, transactions, events
- Photon API — wallet-less signup, rewards, referrals

---

## Backend API Endpoints (selected)

- GET `/api/pools/thala`, `/api/pools/liquidswap`, `/api/pools/merkle` — raw DEX pools
- GET `/api/pools/all` — normalized pools
- GET `/api/scores/top10`, `/api/scores/best-stables` — ranked pools
- POST `/api/vault/withdraw` — admin withdraw endpoint
- POST `/api/photon/login` — Photon login (server-side)
- GET `/api/rewards/fetch` — fetch user rewards

---

## Smart Contract (Move) — `zerog::Vault`

Core functions:
- `init(admin: &signer)` — initialize vault storage and event handles
- `deposit(user: &signer, amount: u64)` — transfer APT from user to vault and update per-user balance
- `withdraw(caller: &signer, user: address, amount: u64)` — admin-only withdrawal to user
- `rebalance(caller: &signer, pool: vector<u8>)` — admin-only rebalancing event trigger

Storage:
- `VaultData` resource: total_balance, user_balances table, event handles

Notes: the vault must be initialized (call `init`) so the `VaultData` resource exists before deposits.

---

## Local Development

Environment variables (frontend `frontend/.env.local` and backend `.env`):

Required (frontend):
- `NEXT_PUBLIC_BACKEND_URL` (e.g. `http://localhost:4000`)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (Google OAuth client id)

Required (backend/.env):
- `ADMIN_PRIVATE_KEY` (hex private key for admin operations)
- `ADMIN_ADDRESS` (deployer/admin address)
- `APTOS_NODE_URL` (Aptos fullnode, e.g. `https://fullnode.testnet.aptoslabs.com`)
- `PHOTON_API_KEY`, `PHOTON_CAMPAIGN_ID`, `PHOTON_BASE_URL` (Photon integration)

Run locally:

Backend:
```bash
cd backend
npm install
node server.js
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Smart contracts (Move): compile & publish with Aptos CLI / Aptos SDK

---

## Usage Notes

- Connect with Petra Wallet or sign in with Photon (Google) for passwordless onboarding.
- Admin-only operations (withdraw, rebalance) require the admin key/server-side signing.
- Scoring and pool aggregation run periodically (cron) and are served via `/api/scores/*`.

---

## Future Roadmap (high level)

- Fully automated asset management and rebalancing strategies
- Multi-asset vaults (APT, USDC, USDT, wETH)
- Fair token launchpad and DAO governance (ZRG token)
- Mobile app and institutional analytics dashboard

---

## Revenue Model (summary)

1. Pay-per-use scoring API (commercial feed)
2. Vault performance fees
3. Swap & routing fees (future aggregator)
4. Launchpad fees and premium analytics subscriptions

---

## Contributing

Contributions are welcome. Please open issues or PRs for bugs, features, or documentation improvements.

---

## License

This repository currently does not include a license file. Add one (e.g., MIT) if you want to make the project open source.
