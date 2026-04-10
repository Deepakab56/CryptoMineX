use anchor_lang::prelude::*;

// #[account]
// #[derive(Debug, InitSpace)]
// pub struct User {
//     pub amount: u64,
//     pub lottery: u64,
//     pub total_ticket_buy: u64,
//     pub total_winner_list: u64,
// }

#[account]
#[derive(Debug, InitSpace)]
pub struct Round {
    pub round_id: u64,
    pub start_time: u64,
    pub end_time: u64,
    pub winner_ticket: u8,
    pub total_amount: u64,
    #[max_len(50)]
    pub users: Vec<Pubkey>,
    pub ticket: u64,
    pub randomness_account: Pubkey,
    pub commit_slot: u64,
    pub is_distribted_reward: bool,
}

#[account]
#[derive(Debug, InitSpace)]
pub struct GlobalState {
    pub admin: Pubkey,
    pub active_round: Pubkey,
    pub round_id: u64,
    pub is_round_active: bool,
}

#[account]
#[derive(Debug, InitSpace)]
pub struct Ticket {
    #[max_len(50)]
    pub users: Vec<Pubkey>,
    pub total_amount: u64,
}

#[account]
#[derive(InitSpace)]
pub struct UserTicket {
    pub user: Pubkey,
    pub round_id: u64,
    pub ticket_no: u8,
    pub amount: u64,
}
