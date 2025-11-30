// types/window.d.ts
interface AptosWallet {
  signAndSubmitTransaction(payload: any): Promise<{ hash: string }>;
  account(): Promise<{ address: string }>;
  connect(): Promise<{ address: string }>;
  disconnect(): Promise<void>;
  network(): Promise<{ name: string }>;
}

interface Window {
  aptos?: AptosWallet;
}
