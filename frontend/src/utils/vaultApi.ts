// utils/vaultApi.ts
export async function requestWithdraw(userAddress: string, amountAPT: number) {
  const res = await fetch("http://localhost:4000/api/vault/withdraw", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user: userAddress,
      amount: amountAPT,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Withdraw failed");
  }

  return res.json();
}
