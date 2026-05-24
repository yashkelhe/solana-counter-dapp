use borsh::{BorshDeserialize, BorshSerialize};

use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    program_error::ProgramError,
    pubkey::Pubkey,
};

entrypoint!(process_instruction);

#[derive(BorshDeserialize, BorshSerialize, Debug)]
struct Counter {
    count: u32,
}

#[derive(BorshDeserialize, BorshSerialize, Debug)]
enum CounterInstruction {
    Initialize,
    Increment,
    Decrement,
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {

    let mut iter = accounts.iter();

    let counter_account = next_account_info(&mut iter)?;

    if counter_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
 
    let mut counter =
        Counter::try_from_slice(&counter_account.data.borrow())?;

    let instruction =
        CounterInstruction::try_from_slice(instruction_data)?;

    match instruction {

        CounterInstruction::Initialize => {
            counter.count = 0;
        }

        CounterInstruction::Increment => {
            counter.count = counter.count
                .checked_add(1)
                .ok_or(ProgramError::InvalidInstructionData)?;
        }

        CounterInstruction::Decrement => {
            counter.count = counter.count
                .checked_sub(1)
                .ok_or(ProgramError::InvalidInstructionData)?;
        }
    }

    counter.serialize(
        &mut &mut counter_account.data.borrow_mut()[..]
    )?;

    Ok(())
}