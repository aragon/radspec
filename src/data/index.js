import dclKnownFunctions from './decentraland/knownFunctions'
import nucypherKnownFunctions from './nucypher/knownFunctions'
import baseKnownFunctions from './knownFunctions'

export const knownFunctions = {
  ...dclKnownFunctions,
  ...nucypherKnownFunctions,
  ...baseKnownFunctions
}
