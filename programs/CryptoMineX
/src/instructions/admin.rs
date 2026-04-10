use anchor_lang::prelude::*;

use crate::{ CustomError, GlobalState, state::Round };

#[derive(Accounts)]
pub struct OpenRound<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds=[b"globals"],
        bump
    )]
    pub global_account: Account<'info, GlobalState>,

    #[account(
        init,
        payer = signer,
        space = 8 + Round::INIT_SPACE,
        seeds = [b"round", global_account.round_id.to_le_bytes().as_ref()],
        bump
    )]
    pub round_account: Account<'info, Round>,
    pub system_program: Program<'info, System>,
}
pub fn process_initialize_round(ctx: Context<OpenRound>) -> Result<()> {
    let global = &mut ctx.accounts.global_account;

    require!(ctx.accounts.signer.key() == global.admin, CustomError::InvalidAuthority);

    require!(!global.is_round_active, CustomError::RoundAlreadyActive);

    let round = &mut ctx.accounts.round_account;

    let current_time = Clock::get()?.unix_timestamp as u64;

    round.round_id = global.round_id;
    round.start_time = current_time;
    round.end_time = current_time + 600;

    round.winner_ticket = 0;
    round.total_amount = 0;
    round.ticket = 0;
    round.users = Vec::new();

    global.is_round_active = true;
    global.active_round = round.key();

    Ok(())
}

#[derive(Accounts)]
pub struct CloseAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds=[b"globals"],
        bump
    )]
    pub global_account: Account<'info, GlobalState>,

    #[account(
        mut,
       seeds = [b"round", global_account.round_id.to_le_bytes().as_ref()],
        bump
    )]
    pub round_account: Account<'info, Round>,
}

pub fn process_close_round(ctx: Context<CloseAccount>) -> Result<()> {
    let global = &mut ctx.accounts.global_account;
    let round = &mut ctx.accounts.round_account;

    require!(ctx.accounts.signer.key() == global.admin, CustomError::InvalidAuthority);

    require!(
        Clock::get()?.unix_timestamp >= (round.end_time as i64),
        CustomError::NotCompleteRound
    );

    if !round.users.is_empty() {
        if !round.is_distribted_reward {
            return Err(CustomError::NotCloseAccount.into());
        }
    }

    require!(global.is_round_active, CustomError::AlreadyEnded);

    global.is_round_active = false;
    global.active_round = Pubkey::default();
    global.round_id += 1;

    Ok(())
}
