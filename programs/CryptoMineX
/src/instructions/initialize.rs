use anchor_lang::prelude::*;

use crate::{ CustomError, GlobalState };

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(init, payer = signer, space = 8 + GlobalState::INIT_SPACE, seeds = [b"globals"], bump)]
    pub global_account: Account<'info, GlobalState>,
    pub system_program: Program<'info, System>,
}

pub fn process_initialize_state(ctx: Context<Initialize>) -> Result<()> {
    let account = &mut ctx.accounts.global_account;

    if account.round_id != 0 {
        return Err(CustomError::InvalidAuthority.into());
    }
    account.active_round = Pubkey::default();
    account.admin = ctx.accounts.signer.key();
    account.is_round_active = false;
    account.round_id += 1;
    Ok(())
}
