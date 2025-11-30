export {};

declare global {
  interface Window {
    aptos?: any;  // Petra wallet
    martian?: any; // (optional) Martian wallet
  }
}
