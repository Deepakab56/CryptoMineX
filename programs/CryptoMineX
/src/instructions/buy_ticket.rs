use anchor_lang::{ prelude::*, system_program::{ Transfer, transfer } };

use crate::{ CustomError, GlobalState, Round, Ticket, UserTicket };

#[derive(Accounts)]
#[instruction(ticket_id:u8)]
pub struct BuyTicket<'info> {
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
        seeds=[b"round",global_account.round_id.to_le_bytes().as_ref()],
        bump  
    )]
    pub round_account: Account<'info, Round>,

    #[account(
        init_if_needed,
        payer = signer,
        space = Ticket::INIT_SPACE,
        seeds = [
            b"ticket",
            global_account.round_id.to_le_bytes().as_ref(),
            ticket_id.to_le_bytes().as_ref(),
        ],
        bump
    )]
    pub ticket_account: Account<'info, Ticket>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + UserTicket::INIT_SPACE,
        seeds = [
            b"user_ticket",
            signer.key().as_ref(),
            global_account.round_id.to_le_bytes().as_ref(),
            ticket_id.to_le_bytes().as_ref(),
        ],
        bump
    )]
    pub user_account: Account<'info, UserTicket>,

    #[account(
        mut,
        seeds=[b"treasury", global_account.round_id.to_le_bytes().as_ref()],
        bump
    )]
    pub treasury: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn process_buy_ticket(ctx: Context<BuyTicket>, ticket_no: u8, amount: u64) -> Result<()> {
    let user_ticket = &mut ctx.accounts.user_account;
    let ticket_account = &mut ctx.accounts.ticket_account;
    let round_account = &mut ctx.accounts.round_account;
    // let global_account = &mut ctx.accounts.global_account;
    let signer = ctx.accounts.signer.key();

    require!(
        round_account.start_time <= (Clock::get()?.unix_timestamp as u64),
        CustomError::RoundNotStarted
    );
    require!(
        round_account.end_time >= (Clock::get()?.unix_timestamp as u64),
        CustomError::RoundEnded
    );
    require!(amount > 0, CustomError::InvalidAmount);
    require!(ticket_no > 0 && ticket_no <= 25, CustomError::InvalidTicket);

    if !round_account.users.contains(&signer) {
        round_account.users.push(signer);
    }

    if !ticket_account.users.contains(&signer) {
        ticket_account.users.push(signer);
    }

    user_ticket.user = signer;
    user_ticket.round_id = round_account.round_id;
    user_ticket.ticket_no = ticket_no;
    user_ticket.amount += amount;

    // ✅ Update round total
    round_account.total_amount += amount;
    ticket_account.total_amount += amount;

    let accounts = Transfer {
        from: ctx.accounts.signer.to_account_info(),
        to: ctx.accounts.treasury.to_account_info(),
    };

    let ctx = CpiContext::new(ctx.accounts.system_program.to_account_info(), accounts);

    transfer(ctx, amount)?;
    Ok(())
}


