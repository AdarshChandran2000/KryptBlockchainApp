
// hardhat-waffle is a plugin used to build smart contract tests
require('@nomiclabs/hardhat-waffle');


// url field is the key from alchemy.com
// accounts field has private key from metamask account
module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: "https://eth-ropsten.alchemyapi.io/v2/Id16z10jmg3lFKea6d0uZilNvfcYq_Cr",
      accounts: [ '4080e539f217d2542038ebd38f98e3c2f4c0e39711377adb30b9a7008ca3ab27']
    }
  }
}