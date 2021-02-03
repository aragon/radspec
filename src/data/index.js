import dclKnownFunctions from './decentraland/knownFunctions'
import nucypherKnownFunctions from './nucypher/knownFunctions'
import melonprotocolKnownFunctions from './melonprotocol/knownFunctions'
import enzymeKnownFunctions from './enzyme/knownFunctions'
import baseKnownFunctions from './knownFunctions'

export const knownFunctions = {
  ...dclKnownFunctions,
  ...nucypherKnownFunctions,
  ...melonprotocolKnownFunctions,
  ...enzymeKnownFunctions,
  ...baseKnownFunctions
}
