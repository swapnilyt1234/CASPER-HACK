use odra::prelude::*;
use odra::casper_types::U512;

#[odra::module]
pub struct DeRiskVault {
    current_premium_rate: Var<u8>,
    halt_coverage: Var<bool>,
    agent_address: Var<Address>,
    stakes: Mapping<Address, U512>,
}

#[odra::odra_error]
pub enum Error {
    AgentNotSet = 1,
    Unauthorized = 2,
}

#[odra::module]
impl DeRiskVault {
    #[odra(init)]
    pub fn init(&mut self, agent: Address) {
        self.agent_address.set(agent);
        self.current_premium_rate.set(5);
        self.halt_coverage.set(false);
    }

    #[odra(payable)]
    pub fn deposit(&mut self) {
        let caller = self.env().caller();
        let value = self.env().attached_value();
        
        let current_stake = self.stakes.get_or_default(&caller);
        self.stakes.set(&caller, current_stake + value);
    }

    pub fn update_risk_params(&mut self, new_rate: u8, halt_coverage: bool) {
        let caller = self.env().caller();
        let agent = match self.agent_address.get() {
            Some(a) => a,
            None => self.env().revert(Error::AgentNotSet),
        };
        
        if caller != agent {
            self.env().revert(Error::Unauthorized);
        }
        
        self.current_premium_rate.set(new_rate);
        self.halt_coverage.set(halt_coverage);
    }

    pub fn get_premium_rate(&self) -> u8 {
        self.current_premium_rate.get_or_default()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use odra::host::{HostEnv, HostRef, Deployer};

    #[test]
    fn test_initialization() {
        let env = odra::test_env();
        let agent = env.get_account(1);
        
        let contract = DeRiskVaultInitArgs { agent }.instantiate(&env);
        assert_eq!(contract.get_premium_rate(), 5);
    }

    #[test]
    fn test_permissioned_update() {
        let env = odra::test_env();
        let agent = env.get_account(1);
        let intruder = env.get_account(2);
        
        let mut contract = DeRiskVaultInitArgs { agent }.instantiate(&env);
        
        // Test authorized
        env.set_caller(agent);
        contract.update_risk_params(20, true);
        assert_eq!(contract.get_premium_rate(), 20);
        
        // Test unauthorized
        env.set_caller(intruder);
        let res = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            contract.update_risk_params(10, false);
        }));
        assert!(res.is_err());
    }
}
