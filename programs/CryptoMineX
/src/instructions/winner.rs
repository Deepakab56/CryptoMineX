use anchor_lang::{ prelude::*, system_program::{ Transfer, transfer } };
use crate::{ CustomError, GlobalState, Round, Ticket, UserTicket };

#[derive(Accounts)]
pub struct WinnerUser<'info> {
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
        seeds=[b"round", global_account.round_id.to_le_bytes().as_ref()],
        bump
    )]
    pub round_account: Account<'info, Round>,

    #[account(
        mut,
        seeds=[b"treasury", global_account.round_id.to_le_bytes().as_ref()],
        bump
    )]
    pub treasury: SystemAccount<'info>,

    #[account(
    mut,
    seeds = [
        b"ticket",
        global_account.round_id.to_le_bytes().as_ref(),
        &[round_account.winner_ticket],
    ],
    bump
)]
    pub ticket_account: Option<Account<'info, Ticket>>,

    #[account(
        mut,
        constraint = admin.key() == global_account.admin @ CustomError::Unauthorized
    )]
    pub admin: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn process_distribute_reward<'info>(
    ctx: Context<'_, '_, 'info, 'info, WinnerUser<'info>>
) -> Result<()> {

    let round = &mut ctx.accounts.round_account;
    let global = &ctx.accounts.global_account;

    require!(
        round.end_time < (Clock::get()?.unix_timestamp as u64),
        CustomError::RoundNotEnded
    );

    require!(
        round.winner_ticket != 0,
        CustomError::WinnerNotRevealed
    );

    let treasury_lamports = **ctx.accounts.treasury.to_account_info().lamports.borrow();

    require!(treasury_lamports > 0, CustomError::TreasuryEmpty);

    let round_id_bytes = global.round_id.to_le_bytes();
    let treasury_bump = ctx.bumps.treasury;

    let seeds: &[&[u8]] = &[b"treasury", round_id_bytes.as_ref(), &[treasury_bump]];
    let signer_seeds: &[&[&[u8]]] = &[seeds];

   
    if ctx.accounts.ticket_account.is_none() {
        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.treasury.to_account_info(),
                    to: ctx.accounts.admin.to_account_info(),
                },
                signer_seeds
            ),
            treasury_lamports
        )?;

        msg!("❌ No ticket account → full amount sent to admin");

        round.is_distribted_reward = true;
        return Ok(());
    }


    let ticket = ctx.accounts.ticket_account.as_ref().unwrap();

    // ✅ CASE 2A: no users
    if ticket.users.is_empty() {
        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.treasury.to_account_info(),
                    to: ctx.accounts.admin.to_account_info(),
                },
                signer_seeds
            ),
            treasury_lamports
        )?;

        msg!("⚠️ No users → full amount sent to admin");

        round.is_distribted_reward = true;
        return Ok(());
    }

  

    let mut total_winning_amount: u64 = 0;

    for i in 0..ticket.users.len() {
        let user_ticket_acc = ctx.remaining_accounts
            .get(i * 2 + 1)
            .ok_or(CustomError::MissingWinnerAccount)?;

        let user_ticket: Account<UserTicket> = Account::try_from(user_ticket_acc)?;
        total_winning_amount += user_ticket.amount;
    }

    require!(total_winning_amount > 0, CustomError::InvalidAmount);

    let mut total_sent: u64 = 0;

    for i in 0..ticket.users.len() {
        let user_account = ctx.remaining_accounts
            .get(i * 2)
            .ok_or(CustomError::MissingWinnerAccount)?;

        let user_ticket_acc = ctx.remaining_accounts
            .get(i * 2 + 1)
            .ok_or(CustomError::MissingWinnerAccount)?;

        let user_ticket: Account<UserTicket> = Account::try_from(user_ticket_acc)?;

        let reward = (user_ticket.amount as u128)
            .checked_mul(treasury_lamports as u128)
            .and_then(|v| v.checked_div(total_winning_amount as u128))
            .ok_or(CustomError::InvalidAmount)? as u64;

        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.treasury.to_account_info(),
                    to: user_account.clone(),
                },
                signer_seeds
            ),
            reward
        )?;

        total_sent += reward;

        msg!("💸 Sent {} lamports to {}", reward, user_account.key());
    }

    // 🧹 leftover dust → admin
    let dust = treasury_lamports.saturating_sub(total_sent);

    if dust > 0 {
        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.treasury.to_account_info(),
                    to: ctx.accounts.admin.to_account_info(),
                },
                signer_seeds
            ),
            dust
        )?;

        msg!("🧹 Dust {} lamports sent to admin", dust);
    }

    round.is_distribted_reward = true;

    msg!("🎯 Distribution complete");

    Ok(())
}