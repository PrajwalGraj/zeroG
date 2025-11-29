const { client, deployer } = require("../config/aptos");

const LAUNCH_MODULE = "zerog::Launchpad";

/**
 * Generic helper for calling a Move entry function.
 */
async function callEntryFunction(func, args = [], typeArgs = []) {
  if (!deployer) throw new Error("Deployer private key missing in .env!");

  const payload = {
    type: "entry_function_payload",
    function: func,
    type_arguments: typeArgs,
    arguments: args.map(a => a.toString()), // Move expects strings for u64
  };

  // Build txn
  const rawTxn = await client.generateTransaction(deployer.address(), payload);
  const signed = await client.signTransaction(deployer, rawTxn);
  const res = await client.submitTransaction(signed);
  await client.waitForTransaction(res.hash);

  return res;
}

/**
 * Create Launch
 */
async function createLaunch(token, capPerWallet, windowSeconds) {
  const func = `${LAUNCH_MODULE}::create_launch`;
  return await callEntryFunction(func, [token, capPerWallet, windowSeconds]);
}

/**
 * Commit to a Launch
 */
async function commitLaunch(launchCreator, amount) {
  const func = `${LAUNCH_MODULE}::commit`;
  return await callEntryFunction(func, [launchCreator, amount]);
}

module.exports = { createLaunch, commitLaunch };
