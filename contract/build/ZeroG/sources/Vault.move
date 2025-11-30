module zerog::Vault {
    use std::signer;
    use aptos_std::table::{Self, Table};
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::event;
    use aptos_framework::account;

    //
    // EVENTS
    //
    struct DepositEvent has copy, drop, store {
        user: address,
        amount: u64,
    }

    struct WithdrawEvent has copy, drop, store {
        user: address,
        amount: u64,
    }

    struct RebalanceEvent has copy, drop, store {
        executor: address,
        pool: vector<u8>,
    }

    //
    // VAULT STORAGE
    //
    struct VaultData has key {
        total_balance: u64,
        user_balances: Table<address, u64>,
        deposit_events: event::EventHandle<DepositEvent>,
        withdraw_events: event::EventHandle<WithdrawEvent>,
        rebalance_events: event::EventHandle<RebalanceEvent>,
    }

    //
    // INIT
    //
    public entry fun init(admin: &signer) {
        // Register to receive APT coins
        if (!coin::is_account_registered<AptosCoin>(@zerog)) {
            coin::register<AptosCoin>(admin);
        };
        
        move_to(admin, VaultData {
            total_balance: 0,
            // create an empty table
            user_balances: table::new<address, u64>(),
            deposit_events: account::new_event_handle<DepositEvent>(admin),
            withdraw_events: account::new_event_handle<WithdrawEvent>(admin),
            rebalance_events: account::new_event_handle<RebalanceEvent>(admin),
        });
    }

    //
    // DEPOSIT APT
    //
    public entry fun deposit(user: &signer, amount: u64) acquires VaultData {
        let user_addr = signer::address_of(user);

        // Transfer APT → vault address
        coin::transfer<AptosCoin>(user, @zerog, amount);

        let vault = borrow_global_mut<VaultData>(@zerog);

        // read previous balance, default 0
        let default = 0;
        let old_ref = table::borrow_with_default(&vault.user_balances, user_addr, &default);
        let old = *old_ref;
        let new = old + amount;

        // insert or update balance
        table::upsert(&mut vault.user_balances, user_addr, new);
        vault.total_balance = vault.total_balance + amount;

        event::emit_event(&mut vault.deposit_events, DepositEvent {
            user: user_addr,
            amount,
        });
    }

    //
    // WITHDRAW
    //
    public entry fun withdraw(caller: &signer, user: address, amount: u64) acquires VaultData {
        let user_addr = user;

        let caller_addr = signer::address_of(caller);
        assert!(caller_addr == @zerog, 201); // Only vault owner can withdraw

        let vault = borrow_global_mut<VaultData>(@zerog);

        // read previous balance, default 0
        let default = 0;
        let old_ref = table::borrow_with_default(&vault.user_balances, user_addr, &default);
        let old = *old_ref;

        assert!(old >= amount, 100);

        // update balance
        table::upsert(&mut vault.user_balances, user_addr, old - amount);
        vault.total_balance = vault.total_balance - amount;

        // send APT from vault owner (caller) to user
        coin::transfer<AptosCoin>(caller, user_addr, amount);

        event::emit_event(&mut vault.withdraw_events, WithdrawEvent {
            user: user_addr,
            amount,
        });
    }

    //
    // REBALANCE (BACKEND CALLS THIS)
    //
    public entry fun rebalance(caller: &signer, pool: vector<u8>) acquires VaultData {
        let caller_addr = signer::address_of(caller);

        // Only the vault admin (your deployer) can rebalance
        assert!(caller_addr == @zerog, 200);

        let vault = borrow_global_mut<VaultData>(@zerog);

        // No actual DEX logic yet — just event
        event::emit_event(&mut vault.rebalance_events, RebalanceEvent {
            executor: caller_addr,
            pool,
        });
    }

    //
    // VIEW FUNCTIONS
    //
    public fun get_user_balance(user: address): u64 acquires VaultData {
        let vault = borrow_global<VaultData>(@zerog);
        let default = 0;
        let val_ref = table::borrow_with_default(&vault.user_balances, user, &default);
        *val_ref
    }

    public fun get_total_balance(): u64 acquires VaultData {
        borrow_global<VaultData>(@zerog).total_balance
    }
}
