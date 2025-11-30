// utils/vaultTx.ts

const CONTRACT_ADDRESS = "0x40e2eb967aa9abb469a5d3437717560c9b77b5af2f27f99c039a7c90c0bfc42d";

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

  const payload = {
    type: "entry_function_payload",
    function: `${CONTRACT_ADDRESS}::Vault::deposit`,
    type_arguments: [],
    arguments: [amount.toString()],
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
