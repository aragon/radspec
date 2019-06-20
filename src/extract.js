const fs = require('fs')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)

const modifiesStateAndIsPublic = declaration =>
  !declaration.match(/\b(internal|private|view|pure|constant)\b/)

const typeOrAddress = type => {
  const types = ['address', 'byte', 'uint', 'int', 'bool', 'string']

  // check if the type starts with any of the above types, otherwise it is probably
  // a typed contract, so we need to return address for the signature
  return types.filter(t => type.indexOf(t) === 0).length > 0 ? type : 'address'
}

// extracts function signature from function declaration
const getSignature = declaration => {
  let [name, params] = declaration.match(/function ([^]*?)\)/)[1].split('(')

  if (!name) {
    return 'fallback'
  }

  let argumentNames = []

  if (params) {
    // Has parameters
    const inputs = params
      .replace(/\n/gm, '')
      .replace(/\t/gm, '')
      .split(',')
    
    params = inputs
      .map(param => param.split(' ').filter(s => s.length > 0)[0])
      .map(type => typeOrAddress(type))
      .join(',')

    argumentNames = inputs.map(param => param.split(' ').filter(s => s.length > 0)[1] || '')
  }

  return { sig: `${name}(${params})`, argumentNames }
}

const getNotice = declaration => {
  // capture from @notice to either next '* @' or end of comment '*/'
  const notices = declaration.match(/(@notice)([^]*?)(\* @|\*\/)/m)
  if (!notices || notices.length === 0) return null

  return notices[0]
    .replace('*/', '')
    .replace('* @', '')
    .replace('@notice ', '')
    .replace(/\n/gm, '')
    .replace(/\t/gm, '')
    .split(' ')
    .filter(x => x.length > 0)
    .join(' ')
}

// extracts required role from function declaration
const getRoles = declaration => {
  const auths = declaration.match(/auth.?\(([^]*?)\)/gm)
  if (!auths) return []

  return auths.map(
    authStatement =>
      authStatement
        .split('(')[1]
        .split(',')[0]
        .split(')')[0]
  )
}

// Takes the path to a solidity file and extracts public function signatures,
// its auth role if any and its notice statement
module.exports = async sourceCodePath => {
  const sourceCode = await readFile(sourceCodePath, 'utf8')

  // everything between every 'function' and '{' and its @notice
  const funcDecs = sourceCode.match(/(@notice|^\s*function)(?:[^]*?){/gm)

  if (!funcDecs) return []

  return funcDecs
    .filter(dec => modifiesStateAndIsPublic(dec))
    .map(dec => ({
        roles: getRoles(dec),
        notice: getNotice(dec),
        ...getSignature(dec),
    }))
}
