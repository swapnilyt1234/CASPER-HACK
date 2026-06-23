#![cfg_attr(not(test), no_main)]
#![no_std]

extern crate alloc;

pub mod derisk_vault;
pub use derisk_vault::DeRiskVault;
