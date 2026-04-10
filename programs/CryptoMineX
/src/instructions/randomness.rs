use anchor_lang::prelude::*;
use switchboard_on_demand::accounts::RandomnessAccountData;

use crate::{ Round, CustomError };

#[derive(Accounts)]
pub struct CommitRandomness<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds=[b"round",round_account.round_id.to_le_bytes().as_ref()],
        bump  
    )]
    pub round_account: Account<'info, Round>,
    /// CHECK: This is a Switchboard randomness account. Verified manually in handler.
    pub randomness_account_data: AccountInfo<'info>,
}

pub fn process_commit_randomness(ctx: Context<CommitRandomness>) -> Result<()> {
    let round = &mut ctx.accounts.round_account;

    require!(
        Clock::get()?.unix_timestamp >= (round.end_time as i64),
        CustomError::NotCompleteRound
    );

    let randomness_data = RandomnessAccountData::parse(
        ctx.accounts.randomness_account_data.data.borrow()
    ).unwrap();

    round.randomness_account = ctx.accounts.randomness_account_data.key();

    round.commit_slot = randomness_data.seed_slot;

    msg!("Randomness committed at slot: {}", round.commit_slot);

    Ok(())
}

#[derive(Accounts)]
pub struct RevealWinner<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds=[b"round", round_account.round_id.to_le_bytes().as_ref()],
        bump
    )]
    pub round_account: Account<'info, Round>,

    /// CHECK: This is a Switchboard randomness account. Verified manually in handler.
    pub randomness_account_data: AccountInfo<'info>,
}

pub fn process_reveal_winner(ctx: Context<RevealWinner>) -> Result<()> {
    let round = &mut ctx.accounts.round_account;
    let clock = Clock::get()?;

    require!(
        Clock::get()?.unix_timestamp >= (round.end_time as i64),
        CustomError::NotCompleteRound
    );

    require!(
        ctx.accounts.randomness_account_data.key() == round.randomness_account,
        CustomError::InvalidRandomness
    );

    let randomness_data = RandomnessAccountData::parse(
        ctx.accounts.randomness_account_data.data.borrow()
    ).unwrap();

    require!(randomness_data.seed_slot == round.commit_slot, CustomError::RandomnessExpired);

    let random = randomness_data
        .get_value(clock.slot)
        .map_err(|_| CustomError::RandomnessNotResolved)?;

    let winner_ticket = (random[0] % 25) + 1;

    round.winner_ticket = winner_ticket;

    msg!("🎉 Winner Ticket: {}", winner_ticket);

    Ok(())
}
