// utils/vaultTx.ts

// Module address (for module calls) — keep as-is if you still call module entry functions
const CONTRACT_ADDRESS = "0x40e2eb967aa9abb469a5d3437717560c9b77b5af2f27f99c039a7c90c0bfc42d";

// Vault receiver address: deposits will be transferred to this account
const VAULT_RECEIVER = "0xad830cc6e2e85cc8a3262154341c1ca426dbda6e2e875cf75af124087b187293";

export async function initializeVault() {
  if (!window.aptos) {
    throw new Error("Petra wallet not found. Please install Petra wallet extension.");
  }

  const payload = {
    type: "entry_function_payload",
    function: `${CONTRACT_ADDRESS}::Vault::init`,
    type_arguments: [],
    arguments: [],
  };

  try {
    const tx = await window.aptos.signAndSubmitTransaction({ payload });
    console.log("Init transaction:", tx);
    return tx;
  } catch (error: any) {
    console.error("Init transaction failed:", error);
    throw new Error(error.message || "Initialization failed");
  }
}

export async function depositToVault(amountAPT: number) {
  // Check for Petra wallet
  if (!window.aptos) {
    throw new Error("Petra wallet not found. Please install Petra wallet extension.");
  }

  const OCTA = 100_000_000; // 1 APT = 1e8 octas
  const amount = Math.floor(amountAPT * OCTA);

  console.log('Deposit Details:');
  console.log('- Input APT:', amountAPT);
  console.log('- Octas to send:', amount);
  console.log('- Verification (octas / 1e8):', amount / OCTA, 'APT');

  // Build a native APT transfer payload to move coins from the user's wallet
  // to the vault receiver address. This performs a direct transfer of
  // `0x1::aptos_coin::AptosCoin` from the signer to `VAULT_RECEIVER`.
  const payload = {
    type: "entry_function_payload",
    function: `0x1::coin::transfer`,
    type_arguments: ["0x1::aptos_coin::AptosCoin"],
    arguments: [VAULT_RECEIVER, amount.toString()],
  };

  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const tx = await window.aptos.signAndSubmitTransaction({ payload });
    return tx;
  } catch (error: any) {
    console.error("Deposit transaction failed:", error);
    throw new Error(error.message || "Transaction failed");
  }
}
