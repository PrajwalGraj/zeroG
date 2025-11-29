module zerog::Launchpad {
    use std::signer;
    use aptos_std::table::{Self, Table};
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::account;

    struct LaunchEvent has copy, drop, store {
        creator: address,
        token: address,
        cap: u64,
        window: u64,
    }

    struct LaunchData has key {
        creator: address,
        token: address,
        cap_per_wallet: u64,
        commits: Table<address, u64>,
        end_time: u64,
        launched: bool,
        events: event::EventHandle<LaunchEvent>,
    }

    public entry fun create_launch(
        creator: &signer,
        token: address,
        cap: u64,
        window: u64
    ) {
        let addr = signer::address_of(creator);

        move_to(creator, LaunchData {
            creator: addr,
            token,
            cap_per_wallet: cap,
            // create an empty table
            commits: table::new<address, u64>(),
            end_time: timestamp::now_seconds() + window,
            launched: false,
            events: account::new_event_handle<LaunchEvent>(creator),
        });
    }

    public entry fun commit(
        user: &signer,
        launch_creator: address,
        amount: u64
    ) acquires LaunchData {
        let user_addr = signer::address_of(user);
        let ld = borrow_global_mut<LaunchData>(launch_creator);

        assert!(timestamp::now_seconds() < ld.end_time, 101);

        // read previous committed amount, default 0 if not present
        let default = 0;
        let already_ref = table::borrow_with_default(&ld.commits, user_addr, &default);
        let already = *already_ref;

        assert!(already + amount <= ld.cap_per_wallet, 102);

        // accept APT
        coin::transfer<AptosCoin>(user, launch_creator, amount);

        // insert or update user commit
        table::upsert(&mut ld.commits, user_addr, already + amount);
    }
}
