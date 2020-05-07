export default {
  'upgrade(address)': 'Upgrade target of this proxy contract to address `$1`',
  'rollback()': 'Rollback this proxy contract to previous target',
  'renounceOwnership()': 'Relinquish control of this contract, making it non-ownable forever',
  'initialize(uint256)': 'Initialize StakingEscrow and transfer `$1` NuNits for rewards',
  'setFeeRateRange(uint128,uint128,uint128)': 'Set minimum, default & maximum fee rate for all stakers and all policies (global fee range) to (`$1`, `$2`, `$3`)'
}
