use anchor_lang::prelude::*;

declare_id!("9VWtCDH3iC58GHWhkEb6wNPas8sVprjjCBKmNbTW4Mbt");

mod instructions;
mod error;
mod state;

pub use instructions::*;
pub use state::*;
pub use error::*;

#[program]
pub mod lottery {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        process_initialize_state(ctx)
    }

    pub fn initialize_round(ctx: Context<OpenRound>) -> Result<()> {
        process_initialize_round(ctx)
    }

    pub fn close_account(ctx: Context<CloseAccount>) -> Result<()> {
        process_close_round(ctx)
    }

    pub fn buy_ticket(ctx: Context<BuyTicket>, ticket_no: u8, amount: u64) -> Result<()> {
        process_buy_ticket(ctx, ticket_no, amount)
    }

    pub fn commit_randomness(ctx: Context<CommitRandomness>) -> Result<()> {
        process_commit_randomness(ctx)
    }

    pub fn reveal_winner(ctx: Context<RevealWinner>) -> Result<()> {
        process_reveal_winner(ctx)
    }
    pub fn distribute_reward<'info>(ctx: Context<'_, '_, 'info, 'info, WinnerUser<'info>>) -> Result<()> {
        process_distribute_reward(ctx)
    }
}
