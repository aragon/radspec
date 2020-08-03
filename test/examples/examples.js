import test from 'ava'
import { BigNumber, ethers } from 'ethers'
import { evaluateRaw } from '../../src/lib'
import { defaultHelpers } from '../../src/helpers'
import { tenPow } from '../../src/helpers/lib/formatBN'
import { ETH } from '../../src/helpers/lib/token'
import knownFunctions from '../../src/data/knownFunctions'

const int = (value) => ({
  type: 'int256',
  value
})

const address = (value = '0x0000000000000000000000000000000000000001') => ({
  type: 'address',
  value
})

const bool = (value) => ({
  type: 'bool',
  value
})

const string = (value) => ({
  type: 'string',
  value
})

const bytes32 = (value) => ({
  type: 'bytes32',
  value
})

const bytes = (value) => ({
  type: 'bytes',
  value
})

const comparisonCases = [
  [{
    source: '`a > 2`',
    bindings: { a: int(3) }
  }, 'true'],
  [{
    source: '`a > b`',
    bindings: { a: int(2), b: int(3) }
  }, 'false'],
  [{
    source: '`a >= b`',
    bindings: { a: int(3), b: int(2) }
  }, 'true'],
  [{
    source: '`a >= b`',
    bindings: { a: int(1), b: int(2) }
  }, 'false'],
  [{
    source: '`a >= b`',
    bindings: { a: int(2), b: int(2) }
  }, 'true'],
  [{
    source: '`a < b`',
    bindings: { a: int(3), b: int(2) }
  }, 'false'],
  [{
    source: '`a < b`',
    bindings: { a: int(2), b: int(3) }
  }, 'true'],
  [{
    source: '`a <= b`',
    bindings: { a: int(3), b: int(2) }
  }, 'false'],
  [{
    source: '`a <= b`',
    bindings: { a: int(1), b: int(2) }
  }, 'true'],
  [{
    source: '`a <= b`',
    bindings: { a: int(3), b: int(3) }
  }, 'true'],
  [{
    source: '`a == b`',
    bindings: { a: int(3), b: int(3) }
  }, 'true'],
  [{
    source: '`a != b`',
    bindings: { a: int(3), b: int(3) }
  }, 'false'],
  [{
    source: '`a > 0x01`',
    bindings: { a: address('0x0000000000000000000000000000000000000002') }
  }, 'true'],
  [{
    source: '`a != 0x01`',
    bindings: { a: address('0x0000000000000000000000000000000000000002') }
  }, 'true'],
  [{
    source: '`a != 0x01`',
    bindings: { a: address('0x0000000000000000000000000000000000000002') }
  }, 'true'],
  [{
    source: '`a > 0x01`',
    bindings: { a: bytes32('0x0000000000000000000000000000000000000000000000000000000000000002') }
  }, 'true']
]

const helperCases = [
  [{
    source: "helper `@echo(@echo('hi '), 1 + 100000 ^ 0)`",
    bindings: {}
  }, 'helper hi hi '],
  [{
    source: 'Balance: `@withDecimals(balance, 18)` ETH',
    bindings: { balance: int('647413054590000000000000') }
  }, 'Balance: 647413.05459 ETH'],
  [{
    source: 'Balance: `@withDecimals(balance, 6)` USDC',
    bindings: { balance: int('647413054590000000000000') }
  }, 'Balance: 647413054590000000 USDC'],
  [{
    source: 'Balance: `@tokenAmount(token, balance, false, 5)` ANT',
    bindings: { token: address('0x960b236A07cf122663c4303350609A66A7B288C0'), balance: int('647413054590000000000000') }
  }, 'Balance: 647413.05459 ANT'],
  [{
    source: 'Balance: `@tokenAmount(token, balance, false, 5)` ANT (non-checksummed)',
    bindings: { token: address('0x960b236a07cf122663c4303350609a66a7b288c0'), balance: int('647413054590000000000000') }
  }, 'Balance: 647413.05459 ANT (non-checksummed)'],
  [{
    source: 'Balance: `@tokenAmount(token, balance, false, 7)` ANT (trailing zeros)',
    bindings: { token: address('0x960b236A07cf122663c4303350609A66A7B288C0'), balance: int('647413054590000000000000') }
  }, 'Balance: 647413.0545900 ANT (trailing zeros)'],
  [{
    source: 'Balance: `@tokenAmount(token, balance, false, 5)` ANT (non-precise)',
    bindings: { token: address('0x960b236A07cf122663c4303350609A66A7B288C0'), balance: int('647413054595780000000000') }
  }, 'Balance: ~647413.05459 ANT (non-precise)'],
  [{
    source: 'Balance: `@tokenAmount(token, balance)`',
    bindings: { token: address(ETH), balance: int('647413054595780000000000') }
  }, 'Balance: 647413.05459578 ETH'],
  [{
    source: 'Balance: `@tokenAmount(token, balance)`',
    bindings: { token: address('0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7'), balance: int('10') }
  }, 'Balance: 10 🦄'],
  [{
    source: 'Balance: `@tokenAmount(token, balance)`',
    bindings: { token: address('0x6b175474e89094c44da98b954eedeac495271d0f'), balance: int('10000000000000000000') }
  }, 'Balance: 10 DAI'],
  [{
    source: 'Balance: `@tokenAmount(token, balance)`',
    bindings: { token: address('0x6b175474e89094c44da98b954eedeac495271d0f'), balance: int('1000000000000000') }
  }, 'Balance: 0.001 DAI'],
  [{
    source: 'Balance: `@tokenAmount(token, balance)`',
    bindings: { token: address('0x6b175474e89094c44da98b954eedeac495271d0f'), balance: int('1') }
  }, 'Balance: 0.000000000000000001 DAI'],
  [{
    source: 'Balance: `@tokenAmount(token, balance, true, 3)`',
    bindings: { token: address('0x6b175474e89094c44da98b954eedeac495271d0f'), balance: int('1') }
  }, 'Balance: ~0.000 DAI'],
  [{
    source: 'Balance: `@tokenAmount(token, balance, true, 3)`',
    bindings: { token: address('0x6b175474e89094c44da98b954eedeac495271d0f'), balance: int('1000000000000000001') }
  }, 'Balance: ~1.000 DAI'],
  [{
    source: 'Balance: `@tokenAmount(token, balance)`',
    bindings: { token: address('0x6b175474e89094c44da98b954eedeac495271d0f'), balance: int('1000000000000000001') }
  }, 'Balance: 1.000000000000000001 DAI'],
  [{
    source: 'Balance: `@tokenAmount(self.token(): address, balance)`',
    bindings: { balance: int('10000000000000000000') },
    options: { to: '0xD39902f046B5885D70e9E66594b65f84D4d1c952' }
  }, 'Balance: 10 ANT'],
  [{
    source: 'Ethereum launched `@formatDate(date)`',
    bindings: { date: int('1438269793') }
  }, 'Ethereum launched Jul. 30th 2015'],
  [{
    source: "Ethereum launched on a `@formatDate(date, 'EEEE')` in `@formatDate(date, 'MMMM yyyy')`",
    bindings: { date: int('1438269793') }
  }, 'Ethereum launched on a Thursday in July 2015'],
  [{
    source: "Period duration is `@transformTime(time, 'day')`",
    bindings: { time: int(3600 * 24 * 2 + 50) }
  }, 'Period duration is 2 days'],
  [{
    source: "Period duration is `@transformTime(time, 'best')`",
    bindings: { time: int(3600 * 24 * 30) }
  }, 'Period duration is 1 month'],
  [{
    source: '3600 seconds is `@transformTime(3600)`',
    bindings: {}
  }, '3600 seconds is 1 hour'],
  [{
    source: "10k minutes is `@transformTime(10 ^ 4, 'second', 'minute')`",
    bindings: {}
  }, '10k minutes is 600000 seconds'],
  [{
    source: 'Hello `@fromHex(firstName)` `@fromHex(lastName, "utf8")`, `@fromHex(n, "number")` `@fromHex("0x69", "ascii")`s the definitive response.',
    bindings: { firstName: bytes32('0x446f75676c6173'), lastName: bytes32('0x4164616d73'), n: bytes('0x2a') }
  }, 'Hello Douglas Adams, 42 is the definitive response.'],
  [{
    source: 'Change required support to `@formatPct(support)`%',
    bindings: { support: int((BigNumber.from(50)).mul(tenPow(16))) } // 50 * 10^16
  }, 'Change required support to 50%'],
  [{
    source: 'Change required support to `@formatPct(support, 10 ^ 18, 1)`%',
    bindings: { support: int((BigNumber.from(40)).mul(tenPow(16)).add((BigNumber.from(43)).mul(tenPow(14)))) } // 40 * 10^16 + 43 * 10^14
  }, 'Change required support to ~40.4%'],
  [{
    source: 'The genesis block is #`@getBlock(n)`',
    bindings: { n: int(0) },
    options: { userHelpers: { getBlock: (provider) => async (n) => ({ type: 'string', value: (await provider.getBlock(n.toNumber())).number }) } }
  }, 'The genesis block is #0'],
  [{
    source: 'Bar `@bar(shift)` foo `@foo(n)`',
    bindings: { shift: bool(true), n: int(7) },
    options: { userHelpers: { bar: () => shift => ({ type: 'string', value: shift ? 'BAR' : 'bar' }), foo: () => n => ({ type: 'number', value: n * 7 }) } }
  }, 'Bar BAR foo 49']
]

const dataDecodeCases = [
  [{
    source: 'Perform action: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0x13af40350000000000000000000000000000000000000000000000000000000000000002') // setOwner(address), on knownFunctions
    }
  }, 'Perform action: Set 0x0000000000000000000000000000000000000002 as the new owner'],
  [{
    source: 'Payroll: `@radspec(addr, data)`!',
    bindings: {
      addr: address(),
      data: bytes('0x6881385b') // payday(), on knownFunctions
    }
  }, 'Payroll: Get owed Payroll allowance!'],
  [{
    source: 'Melonprotocol: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0xf34ada68000000000000000000000000ec67005c4e498ec7f55e092bd1d35cbc47c9189200000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001c0000000000000000000000000000000000000000000000000000000000000000b4d656c6f6e20546f6b656e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000034d4c4e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000') // registerAsset(address,string,string,string,uint256,uint256[],bytes4[]), on melonprotocol's knownFunctions
    }
  }, 'Melonprotocol: Register new asset MLN (Melon Token) at 0xec67005c4E498Ec7f55E092bd1d35cbC47C91892 (reserve min: 1)'],
  [{
    source: 'Melonprotocol: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0x336790fa000000000000000000000000ec67005c4e498ec7f55e092bd1d35cbc47c91892000000000000000000000000ec67005c4e498ec7f55e092bd1d35cbc47c918920000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000016100000000000000000000000000000000000000000000000000000000000000') // registerExchangeAdapter(address,address,bool,bytes4[]), on melonprotocol's knownFunctions
    }
  }, 'Melonprotocol: Register new adapter 0xec67005c4E498Ec7f55E092bd1d35cbC47C91892 for exchange 0xec67005c4E498Ec7f55E092bd1d35cbC47C91892'],
  [{
    source: 'Melonprotocol: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0x18e467f700000000000000000000000ec67005c4e498ec7f55e092bd1d35cbc47c918920000000000000000000000000000000000000000000000000000000000000001') // registerVersion(address,bytes32), on melonprotocol's knownFunctions
    }
  }, 'Melonprotocol: Register new version 0xec67005c4E498Ec7f55E092bd1d35cbC47C91892'],
  [{
    source: 'Melonprotocol: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0x0129df11000000000000000000000000000000000000000000000000002386F26FC10000') // setIncentive(uint256), on melonprotocol's knownFunctions
    }
  }, 'Melonprotocol: Set incentive to 10000000000000000'],
  [{
    source: 'Melonprotocol: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0xbda5310700000000000000000000000ec67005c4e498ec7f55e092bd1d35cbc47c91892') // setPriceSource(address), on melonprotocol's knownFunctions
    }
  }, 'Melonprotocol: Set price source to 0xec67005c4E498Ec7f55E092bd1d35cbC47C91892'],
  [{
    source: 'Melonprotocol: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0x9e0a457000000000000000000000000ec67005c4e498ec7f55e092bd1d35cbc47c91892') // setMlnToken(address), on melonprotocol's knownFunctions
    }
  }, 'Melonprotocol: Set Melon token to 0xec67005c4E498Ec7f55E092bd1d35cbC47C91892'],
  [{
    source: 'Melonprotocol: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0x671521e8000000000000000000000000ec67005c4e498ec7f55e092bd1d35cbc47c91892') // setNativeAsset(address), on melonprotocol's knownFunctions
    }
  }, 'Melonprotocol: Set native asset to 0xec67005c4E498Ec7f55E092bd1d35cbC47C91892'],
  [{
    source: 'Melonprotocol: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0x0e830e49000000000000000000000000ec67005c4e498ec7f55e092bd1d35cbc47c91892') // setEngine(address), on melonprotocol's knownFunctions
    }
  }, 'Melonprotocol: Set engine to 0xec67005c4E498Ec7f55E092bd1d35cbC47C91892'],
  [{
    source: 'Melonprotocol: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0xc35d8621000000000000000000000000ec67005c4e498ec7f55e092bd1d35cbc47c91892') // setMGM(address), on melonprotocol's knownFunctions
    }
  }, 'Melonprotocol: Set MGM to 0xec67005c4E498Ec7f55E092bd1d35cbC47C91892'],
  [{
    source: 'Melonprotocol: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0x8b522db9000000000000000000000000ec67005c4e498ec7f55e092bd1d35cbc47c91892') // setEthfinexWrapperRegistry(address), on melonprotocol's knownFunctions
    }
  }, 'Melonprotocol: Set Ethfinex wrapper registry to 0xec67005c4E498Ec7f55E092bd1d35cbC47C91892'],
  [{
    source: 'Melonprotocol: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0x2317ef67000000000000000000000000ec67005c4e498ec7f55e092bd1d35cbc47c918920000000000000000000000000000000000000000000000000000000000000001') // removeAsset(address,uint256), on melonprotocol's knownFunctions
    }
  }, 'Melonprotocol: Remove asset 0xec67005c4E498Ec7f55E092bd1d35cbC47C91892'],
  [{
    source: 'Melonprotocol: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0xf31507df000000000000000000000000ec67005c4e498ec7f55e092bd1d35cbc47c918920000000000000000000000000000000000000000000000000000000000000001') // removeExchangeAdapter(address,uint256), on melonprotocol's knownFunctions
    }
  }, 'Melonprotocol: Remove exchange adapter 0xec67005c4E498Ec7f55E092bd1d35cbC47C91892'],
  [{
    source: 'Melonprotocol: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0x24da4f1900000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000ec67005c4e498ec7f55e092bd1d35cbc47c91892') // registerFees(address[]), on melonprotocol's knownFunctions
    }
  }, 'Melonprotocol: Register fees 0xec67005c4E498Ec7f55E092bd1d35cbC47C91892'],
  [{
    source: 'Melonprotocol: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0xe2a1b39800000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000ec67005c4e498ec7f55e092bd1d35cbc47c91892') // deregisterFees(address[]), on melonprotocol's knownFunctions
    }
  }, 'Melonprotocol: De-register fees 0xec67005c4E498Ec7f55E092bd1d35cbC47C91892'],
  [{
    source: 'Melonprotocol: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0xa91ee0dc000000000000000000000000ec67005c4e498ec7f55e092bd1d35cbc47c91892') // setRegistry(address), on melonprotocol's knownFunctions
    }
  }, 'Melonprotocol: Set registry to 0xec67005c4E498Ec7f55E092bd1d35cbC47C91892'],
  [{
    source: 'Melonprotocol: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0xd69ec025000000000000000000000000000000000000000000000000000000003B9ACA00') // setAmguPrice(uint256), on melonprotocol's knownFunctions
    }
  }, 'Melonprotocol: Set AMGU price to 1000000000'],
  [{
    source: 'Decentraland: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0x19dad16d00000000000000000000000000000000000000000000000000000000000061A8') // setOwnerCutPerMillion(uint256), on decentraland's knownFunctions
    }
  }, 'Decentraland: Set fees to 2.5%'],
  [{
    source: 'Decentraland: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0x1206dc5f00000000000000000000000031ab1f92344e3277ce9404e4e097dab7514e6d27') // transferMarketplaceOwnership(address), on decentraland's knownFunctions
    }
  }, 'Decentraland: Transfer ownership of the marketplace to 0x31AB1f92344e3277ce9404E4e097dab7514E6D27'],
  [{
    source: 'Decentraland: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0xc987336c000000000000000000000000f87e31492faf9a91b02ee0deaad50d51d56d5d4d00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000') // upgrade(address,bytes), on decentraland's knownFunctions
    }
  }, 'Decentraland: Upgrade the contract to 0xF87E31492Faf9A91B02Ee0dEAAd50d51d56D5d4d'], 
  [{
    source: 'Decentraland: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0x3659cfe6000000000000000000000000f87e31492faf9a91b02ee0deaad50d51d56d5d4d') // upgradeTo(address), on decentraland's knownFunctions
    }
  }, 'Decentraland: Upgrade the contract to 0xF87E31492Faf9A91B02Ee0dEAAd50d51d56D5d4d'],
  [{
    source: 'Decentraland: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0x4f1ef286000000000000000000000000f87e31492faf9a91b02ee0deaad50d51d56d5d4d00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000') // upgradeToAndCall(address,bytes), on decentraland's knownFunctions
    }
  }, 'Decentraland: Upgrade the contract to 0xF87E31492Faf9A91B02Ee0dEAAd50d51d56D5d4d'],
  [{
    source: 'Decentraland: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0x61a822f9000000000000000000000000F87E31492Faf9A91B02Ee0dEAAd50d51d56D5d4d') // setLandBalanceToken(address), on decentraland's knownFunctions
    }
  }, 'Decentraland: Set LAND balance token 0xF87E31492Faf9A91B02Ee0dEAAd50d51d56D5d4d'],
  [{
    source: 'Decentraland: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0xc95243d3000000000000000000000000F87E31492Faf9A91B02Ee0dEAAd50d51d56D5d4d') // setEstateLandBalanceToken(address), on decentraland's knownFunctions
    }
  }, 'Decentraland: Set LAND balance token 0xF87E31492Faf9A91B02Ee0dEAAd50d51d56D5d4d'],
  [{
    source: 'NuCypher: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0x0900f01000000000000000000000000031ab1f92344e3277ce9404e4e097dab7514e6d27') // upgrade(address), on NuCypher's knownFunctions
    }
  }, 'NuCypher: Upgrade target of this proxy contract to address 0x31AB1f92344e3277ce9404E4e097dab7514E6D27'],
  [{
    source: 'NuCypher: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0x9afd9d78') // rollback(), on NuCypher's knownFunctions
    }
  }, 'NuCypher: Rollback this proxy contract to previous target'],
  [{
    source: 'NuCypher: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0x715018a6') // renounceOwnership(), on NuCypher's knownFunctions
    }
  }, 'NuCypher: Relinquish control of this contract, making it non-ownable forever'],
  [{
    source: 'NuCypher: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0xda35a26f000000000000000000000000000000000000000000000000000000000000002a0000000000000000000000000fabadaacabadafabadaacabadafabadaacabada') // initialize(uint256,address), on NuCypher's knownFunctions
    }
  }, 'NuCypher: Initialize StakingEscrow and transfer 42 NuNits from 0x0fABadaACaBadafaBadaACAbadAFabaDAaCabada for rewards'],
  [{
    source: 'NuCypher: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0x631722f2000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001e') // setFeeRateRange(uint128,uint128,uint128), on NuCypher's knownFunctions
    }
  }, 'NuCypher: Set minimum, default & maximum fee rate for all stakers and all policies (global fee range) to (10, 20, 30)'],
  [{
    source: 'Transfer: `@radspec(addr, data)`',
    bindings: {
      addr: address('0x960b236a07cf122663c4303350609a66a7b288c0'),
      data: bytes('0xa9059cbb00000000000000000000000031ab1f92344e3277ce9404e4e097dab7514e6d2700000000000000000000000000000000000000000000000821ab0d4414980000') // transfer(), on knownFunctions requiring helpers
    }
  }, 'Transfer: Transfer 150 ANT to 0x31AB1f92344e3277ce9404E4e097dab7514E6D27'],
  [{
    source: 'ApproveAndCall: `@radspec(addr, data)`',
    bindings: {
      addr: address('0x960b236a07cf122663c4303350609a66a7b288c0'),
      data: bytes('0xcae9ca510000000000000000000000000256bf39b5f51c6b151edd897a1f2ab97a1c7aba0000000000000000000000000000000000000000000000056bc75e2d63100000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000') // approveAndCall(address,uint256,bytes), on knownFunctions requiring helpers
    }
  }, 'ApproveAndCall: Approve 0x0256bF39B5f51c6B151edd897a1f2ab97A1C7aBA to spend 100 ANT on your behalf and trigger a function in the contract at 0x0256bF39B5f51c6B151edd897a1f2ab97A1C7aBA'],
  [{
    source: 'Cast a `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0xdf133bca') // vote(uint256,bool,bool), from on-chain registry
    }
  }, 'Cast a Vote'],
  [{
    source: 'Cast a `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0xdf133bca') // vote(uint256,bool,bool), from on-chain registry
    }
  }, 'Cast a Vote'],
  [{
    source: 'Perform action: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0x0b30a8d7') // getLocators(address,uint256), from 4bytes api
    }
  }, 'Perform action: Get Locators'],
  [{
    source: 'Perform action: `@radspec(addr, data)`',
    bindings: {
      addr: address(),
      data: bytes('0x12') // bad signature
    }
  }, 'Perform action: Unknown function (0x12)']
]

const cases = [
  // Bindings
  [{
    source: 'a is `a`, b is `b` and "c d" is `c d`',
    bindings: { a: int(1), b: int(2), c: int(3), d: int(4) }
  }, 'a is 1, b is 2 and "c d" is 3 4'],
  [{
    source: "An empty string`''`",
    bindings: {}
  }, 'An empty string'],

  // Maths
  [{
    source: 'Will multiply `a` by 7 and return `a * 7`',
    bindings: { a: int(122) }
  }, 'Will multiply 122 by 7 and return 854'],
  [{
    source: 'First case is `2 * 2 + 6`, second case is `2 * (2 + 6)`'
  }, 'First case is 10, second case is 16'],
  [{
    source: 'First case is `2^5`, second case is `2^2 + 1`'
  }, 'First case is 32, second case is 5'],
  [{
    source: 'First case is `(11 - 1) * 2^5`, second case is `3 * 2 ^ (4 - 1) + 1`'
  }, 'First case is 320, second case is 25'],
  [{
    source: 'First case is `(11 - 1) / 2`, second case is `3 * 2 ^ (4 - 1) / 3`'
  }, 'First case is 5, second case is 8'],
  [{
    source: 'First case is `(11 - 1) % 3`, second case is `3 * 2 % 5`'
  }, 'First case is 1, second case is 1'],
  [{
    source: "Basic arithmetic: `a` + `b` is `a + b`, - `c` that's `a + b - c`, quick mafs",
    bindings: { a: int(2), b: int(2), c: int(1) }
  }, "Basic arithmetic: 2 + 2 is 4, - 1 that's 3, quick mafs"],
  [{
    source: 'This will default to `b`: `a || b`',
    bindings: { a: int(0), b: int(1) }
  }, 'This will default to 1: 1'],
  [{
    source: 'This will default to `a`: `a || b`',
    bindings: { a: int(1), b: int(0) }
  }, 'This will default to 1: 1'],
  [{
    source: 'This will default to `b`: `a || b`',
    bindings: {
      a: bytes32('0x0000000000000000000000000000000000000000000000000000000000000000'),
      b: int(1)
    }
  }, 'This will default to 1: 1'],

  // Conditionals
  [{
    source: 'True is not `false ? true : false`',
    bindings: {}
  }, 'True is not false'],
  [{
    source: "`a == 0x0 ? 'concat ' + a : 'else'`",
    bindings: { a: address('0x0000000000000000000000000000000000000000') }
  }, 'concat 0x0000000000000000000000000000000000000000'],
  [{
    source: "`a == 0x0 ? 'concat ' + a : 'else'`",
    bindings: { a: address('0x0000000000000000000000000000000000000001') }
  }, 'else'],

  // External calls
  [{
    source: 'Allocate `amount token.symbol(): string`.',
    bindings: { amount: int(100), token: address('0x960b236A07cf122663c4303350609A66A7B288C0') }
  }, 'Allocate 100 ANT.'],
  [{
    source: 'Allocate `amount token.symbol(): string` (non-checksummed).',
    bindings: { amount: int(100), token: address('0x960b236a07cf122663c4303350609a66a7b288c0') }
  }, 'Allocate 100 ANT (non-checksummed).'],
  [{
    source: 'Burns the `token.symbol(): string` balance of `person` (balance is `token.balanceOf(person): uint256 / 1000000000000000000`)',
    bindings: { token: address('0x960b236A07cf122663c4303350609A66A7B288C0'), person: address('0x0000000000000000000000000000000000000001') }
  }, 'Burns the ANT balance of 0x0000000000000000000000000000000000000001 (balance is 0)'],
  [{
    source: 'Burns the `self.symbol(): string` balance of `person` (balance is `self.balanceOf(person): uint256 / 1000000000000000000`)',
    bindings: { person: address('0x0000000000000000000000000000000000000001') },
    options: { to: '0x960b236A07cf122663c4303350609A66A7B288C0' }
  }, 'Burns the ANT balance of 0x0000000000000000000000000000000000000001 (balance is 0)'],
  [{
    source: 'Send ETH to the sale at block `((self.controller(): address).sale(): address).initialBlock(): uint` from `person`',
    bindings: { person: address('0x0000000000000000000000000000000000000001') },
    options: { to: '0x960b236A07cf122663c4303350609A66A7B288C0' }
  }, 'Send ETH to the sale at block 3723000 from 0x0000000000000000000000000000000000000001'],
  [{
    source: "Initialize Finance app for Vault at `_vault` with period length of `(_periodDuration - _periodDuration % 86400) / 86400` day`_periodDuration >= 172800 ? 's' : ' '`",
    bindings: { _periodDuration: int(86400 * 2), _vault: address('0x960b236A07cf122663c4303350609A66A7B288C0') }
  }, 'Initialize Finance app for Vault at 0x960b236A07cf122663c4303350609A66A7B288C0 with period length of 2 days'],
  [{
    source: "Vote `_supports ? 'yay' : 'nay'`",
    bindings: { _supports: bool(false) }
  }, 'Vote nay'],
  [{
    source: 'Token `_amount / 10^18`',
    bindings: { _amount: int(BigNumber.from(10).mul(BigNumber.from(10).pow(BigNumber.from(18)))) }
  }, 'Token 10'],
  [{
    source: "`_bool ? 'h' + _var + 'o' : 'bye'`",
    bindings: { _bool: bool(true), _var: string('ell') }
  }, 'hello'],

  // External calls with multiple return values
  [{
    source: 'Explicit: Transaction with ID `txId` was sent to `self.getTransaction(txId): (uint64, uint256, uint256, uint64, address, <address>, bool, uint64)`',
    bindings: { txId: { type: 'uint256', value: 1 } },
    options: { to: '0xf562B25Db6e707694ceC3A4908dC58fF6bDABa40' }
  }, 'Explicit: Transaction with ID 1 was sent to 0x52EC80600642CeddE9De1F570335481C348BE74C'],
  [{
    source: 'Implicit: `token.symbol(): (string)`',
    bindings: { token: address('0x960b236a07cf122663c4303350609a66a7b288c0') }
  }, 'Implicit: ANT'],
  [{
    source: 'Explicit (last type): `self.getTransaction(txId): (uint64, uint256, uint256, uint64, address, address, bool, <uint64>)`',
    bindings: { txId: { type: 'uint256', value: 1 } },
    options: { to: '0xf562B25Db6e707694ceC3A4908dC58fF6bDABa40' }
  }, 'Explicit (last type): 1568811601'],
  [{
    source: 'Explicit (first type): `self.getTransaction(txId): (<uint64>, uint256, uint256, uint64, address, address, bool, uint64)`',
    bindings: { txId: { type: 'uint256', value: 1 } },
    options: { to: '0xf562B25Db6e707694ceC3A4908dC58fF6bDABa40' }
  }, 'Explicit (first type): 0'],

  // msg.(sender | value | data) options
  [{
    source: 'No value: Send `@tokenAmount(token, msg.value)` from `msg.sender` to `receiver`',
    bindings: { token: address(ETH), receiver: address('0x8401Eb5ff34cc943f096A32EF3d5113FEbE8D4Eb') },
    options: { from: '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7' }
  }, 'No value: Send 0 ETH from 0xb4124cEB3451635DAcedd11767f004d8a28c6eE7 to 0x8401Eb5ff34cc943f096A32EF3d5113FEbE8D4Eb'],

  [{
    source: 'With value: Send `@tokenAmount(token, msg.value)` from `msg.sender` to `receiver`',
    bindings: { token: address(ETH), receiver: address('0x8401Eb5ff34cc943f096A32EF3d5113FEbE8D4Eb') },
    options: { from: '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7', value: '1000000000000000000' }
  }, 'With value: Send 1 ETH from 0xb4124cEB3451635DAcedd11767f004d8a28c6eE7 to 0x8401Eb5ff34cc943f096A32EF3d5113FEbE8D4Eb'],

  [{
    source: 'Sending tx with data `msg.data` to contract at `contract`',
    bindings: { contract: address('0x960b236A07cf122663c4303350609A66A7B288C0') },
    options: { data: '0xabcdef' }
  }, 'Sending tx with data 0xabcdef to contract at 0x960b236A07cf122663c4303350609A66A7B288C0'],

  // using msg.data on a helper
  [{
    source: 'Performs a call to `@radspec(contract, msg.data)`',
    bindings: { contract: address('0x960b236A07cf122663c4303350609A66A7B288C0') },
    options: { data: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(Object.keys(knownFunctions)[3])).slice(0, 10) }
  }, `Performs a call to ${Object.values(knownFunctions)[3]}`],

  ...comparisonCases,
  ...helperCases,
  ...dataDecodeCases
]

cases.forEach(([input, expected], index) => {
  test(`${index} - ${input.source}`, async (t) => {
    const { userHelpers } = input.options || {}
    const actual = await evaluateRaw(
      input.source,
      input.bindings,
      {
        ...input.options,
        availableHelpers: { ...defaultHelpers, ...userHelpers }
      }
    )
    t.is(
      actual,
      expected,
      `Expected "${input.source}" to evaluate to "${expected}", but evaluated to "${actual}"`
    )
  })
})
