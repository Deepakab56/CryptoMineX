use anchor_lang::prelude::*;

#[error_code]
pub enum CustomError {
    #[msg("Signer does not have authority to perform this action")]
    InvalidAuthority,

    #[msg("A round is already in progress")]
    RoundAlreadyActive,

    #[msg("The round has already ended")]
    AlreadyEnded,

    #[msg("The round has not yet completed")]
    NotCompleteRound,

    #[msg("The round has not started yet")]
    RoundNotStarted,

    #[msg("The round has ended and no longer accepts participation")]
    RoundEnded,

    #[msg("The round has not ended yet; please wait until the round concludes")]
    RoundNotEnded,

    #[msg("The provided amount is invalid or does not meet the minimum requirement")]
    InvalidAmount,

    #[msg("The specified ticket number is invalid for this round")]
    InvalidTicket,

    #[msg("The randomness account provided is invalid or does not match the committed account")]
    InvalidRandomness,

    #[msg("The randomness commitment has expired; please recommit before revealing")]
    RandomnessExpired,

    #[msg(
        "Randomness has not been resolved yet; please wait for the oracle to fulfill the request"
    )]
    RandomnessNotResolved,

    #[msg("The winner has not been revealed yet; please complete the reveal phase first")]
    WinnerNotRevealed,

    #[msg("The treasury account has insufficient funds to distribute rewards")]
    TreasuryEmpty,

    #[msg("One or more winner accounts are missing from the remaining accounts list")]
    MissingWinnerAccount,

    #[msg("Unauthorized: the signer is not the program admin")]
    Unauthorized,

    #[msg("All winner reward accounts must be closed before this operation can proceed")]
    NotCloseAccount,
}
