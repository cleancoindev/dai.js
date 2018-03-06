import EthereumTokenService from './EthereumTokenService';
import tokens from '../../contracts/tokens';
var utils = require('ethers').utils;

test('getTokens returns tokens', (done) => {
  const ethereumTokenService = EthereumTokenService.buildEthersService();
  ethereumTokenService.manager().connect()
    .then(() => {
      return ethereumTokenService.getTokens();
    })
    .then((tokensList)=>{
      expect(tokensList.includes(tokens.DAI)).toBe(true);
      expect(tokensList.includes(tokens.MKR)).toBe(true);
      done();
    });
});

test('getTokenVersions returns token versions using remote blockchain', (done) => {
  const ethereumTokenService = EthereumTokenService.buildRemoteService(); //needed to build a remote service here so that its either on mainnet or kovan
  ethereumTokenService.manager().connect()
    .then(() => {
      return ethereumTokenService.getTokenVersions();
    })
    .then((tokenVersions)=>{
      expect(tokenVersions[tokens.MKR]).toEqual([1,2]);
      expect(tokenVersions[tokens.DAI]).toEqual([1]);
      done();
    });
});

test('getToken throws when given unknown token symbol', (done) => {
  const ethereumTokenService = EthereumTokenService.buildEthersService();
  ethereumTokenService.manager().connect()
    .then(() => {
      expect(() => ethereumTokenService.getToken('XYZ')).toThrow();
      done();
    });
});


test('get ERC20 (MKR) balance of address', (done) => {
  const ethereumTokenService = EthereumTokenService.buildEthersService(); //need to connect to a blockchain with deployed contracts
  ethereumTokenService.manager().connect()
    .then(() => {
      return ethereumTokenService.getToken(tokens.MKR);
    })
    .then(token => token.balanceOf('0x0000000000000000000000000000000000000001'))
    .then(balance =>{
      expect(parseInt(balance.toString(10),10)).toBe(0);
      done();
    });
});

test('get ERC20 (MKR) allowance of address', (done) => {
  const ethereumTokenService = EthereumTokenService.buildEthersService(); //need to connect to a blockchain with deployed contracts
  ethereumTokenService.manager().connect()
    .then(() => {
      return ethereumTokenService.getToken(tokens.MKR);
    })
    .then(token => token.allowance('0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002'))
    .then(allowance =>{
      expect(parseInt(allowance.toString(10),10)).toBe(0);
      done();
    });
});

test('approve an ERC20 (MKR) allowance', (done) => {
  const ethereumTokenService = EthereumTokenService.buildEthersService(); //need to connect to a blockchain with deployed contracts
  ethereumTokenService.manager().connect()
    .then(() => {
      return ethereumTokenService.getToken(tokens.MKR);
    })
    .then(token => token.approve('0x0000000000000000000000000000000000000001', 10000))
    .then(transaction =>{
      expect(!!transaction).toBe(true);
      done();
    });
});

test('approveUnlimited an ERC20 (MKR) allowance', (done) => {
  const ethereumTokenService = EthereumTokenService.buildEthersService(); //need to connect to a blockchain with deployed contracts
  ethereumTokenService.manager().connect()
    .then(() => {
      return ethereumTokenService.getToken(tokens.MKR);
    })
    .then(token => token.approveUnlimited('0x0000000000000000000000000000000000000001'))
    .then(transaction =>{
      expect(!!transaction).toBe(true);
      done();
    });
});

/*
test('transfer EtherToken using test blockchain', (done) => {
  const ethereumTokenService = EthereumTokenService.buildTestService();
  const token = ethereumTokenService.getToken(tokens.ETH);
  let initSenderBalance = 0;
  let initReceiverBalance = 0;
  const senderAddress = '0x16fb96a5fa0427af0c8f7cf1eb4870231c8154b6';
  const amount = utils.parseEther('0.0000000015');
  ethereumTokenService.manager().connect()
    .then(() =>{
      return Promise.all([
        token.balanceOf(senderAddress),
        token.balanceOf('0x0000000000000000000000000000000000000001')
        ])
    })
    .then(initialBalances => {
      initSenderBalance = initialBalances[0];
      initReceiverBalance = initialBalances[1];
      return token.transfer(senderAddress, '0x0000000000000000000000000000000000000001', 0.0000000015);
    })
    .then(() => {
      return Promise.all([
        token.balanceOf(senderAddress),
        token.balanceOf('0x0000000000000000000000000000000000000001')
        ])
    })
    .then(finalBalances =>{
      expect(parseInt(finalBalances[1].toString(10),10)-initReceiverBalance).toEqual(0.0000000015); 
      expect(parseInt(finalBalances[0].toString(10),10)+0.0000000015).toEqual(initSenderBalance);
      done();
    });
});


test('transfer EtherToken using blockchain from EthersJS', (done) => {
  const ethereumTokenService = EthereumTokenService.buildEthersService();
  const token = ethereumTokenService.getToken(tokens.ETH);
  let initSenderBalance = 0;
  let initReceiverBalance = 0;
  ethereumTokenService.manager().connect()
    .then(() =>{
      return Promise.all([
        token.balanceOf('0x81431b69b1e0e334d4161a13c2955e0f3599381e'),
        token.balanceOf('0x0000000000000000000000000000000000000001')
        ])
    })
    .then(initialBalances => {
      initSenderBalance = initialBalances[0];
      initReceiverBalance = initialBalances[1];
      return token.transfer('0x81431b69b1e0e334d4161a13c2955e0f3599381e', '0x0000000000000000000000000000000000000001', 15);
    })
    .then(() => {
      return Promise.all([
        token.balanceOf('0x81431b69b1e0e334d4161a13c2955e0f3599381e'),
        token.balanceOf('0x0000000000000000000000000000000000000001')
        ])
    })
    .then(finalBalances =>{
      expect(parseInt(finalBalances[1].toString(10),10)-initReceiverBalance).toEqual(15); 
      //expect(parseInt(finalBalances[0].toString(10),10)+15).toEqual(initSenderBalance); //need to figure out how to subtract gas cost from this
      done();
    });
});

test('transfer EtherToken using EthersJS send function', (done) => {
  const ethereumTokenService = EthereumTokenService.buildEthersService();
  const token = ethereumTokenService.getToken(tokens.ETH);
  let initSenderBalance = 0;
  let initReceiverBalance = 0;
  ethereumTokenService.manager().connect()
    .then(() =>{
      return Promise.all([
        token.balanceOf('0x81431b69b1e0e334d4161a13c2955e0f3599381e'),
        token.balanceOf('0x0000000000000000000000000000000000000005')
        ])
    })
    .then(initialBalances => {
      initSenderBalance = initialBalances[0];
      initReceiverBalance = initialBalances[1];
      return token.transferWithEthersJS('0x81431b69b1e0e334d4161a13c2955e0f3599381e', '0x0000000000000000000000000000000000000005', 15); //try this with different numbers, or big number objects
    })
    .then(() => {
      return Promise.all([
        token.balanceOf('0x81431b69b1e0e334d4161a13c2955e0f3599381e'),
        token.balanceOf('0x0000000000000000000000000000000000000005')
        ])
    })
    .then(finalBalances =>{
      expect(parseInt(finalBalances[1].toString(10),10)-initReceiverBalance).toEqual(15); 
      expect(parseInt(finalBalances[0].toString(10),10)+15).toEqual(initSenderBalance); //need to figure out how to subtract gas cost from this
      done();
    });
});
*/



test('get Ether balance using test blockchain', (done) => {
  const ethereumTokenService = EthereumTokenService.buildTestService();
  ethereumTokenService.manager().connect()
    .then(() => {
      const token =  ethereumTokenService.getToken(tokens.ETH);
      return token.balanceOf('0x0000000000000000000000000000000000000003'); //update to check balance of account with ether
    })
    .then(balance => {
      expect(parseInt(balance.toString(10),10)).toEqual(0);
      done();
    });
});

/*
test('get Ether balance using blockchain from EthersJS', (done) => {
  const ethereumTokenService = EthereumTokenService.buildEthersService();
  ethereumTokenService.manager().connect()
    .then(() => {
      const token =  ethereumTokenService.getToken(tokens.ETH);
      return token.balanceOf('0x0000000000000000000000000000000000000003'); //update to check balance of account with ether
    })
    .then(balance => {
      expect(parseInt(balance.toString(10),10)).toEqual(0);
      done();
    });
});*/

test('get Ether balance using EthersJS getBalance', (done) => {
  const ethereumTokenService = EthereumTokenService.buildEthersService();
  ethereumTokenService.manager().connect()
    .then(() => {
      const token =  ethereumTokenService.getToken(tokens.ETH);
      return token.balanceOfWithEthersJS('0x000000000000000000000000000000000000000b'); //update to check balance of account with ether
    })
    .then(balance => {
      expect(parseInt(balance.toString(10),10)).toEqual(0);
      done();
    });
});


test('get Ether allowance returns max safe integer', (done) => {
  const ethereumTokenService = EthereumTokenService.buildTestService();
  ethereumTokenService.manager().connect()
    .then(() => {
      const token = ethereumTokenService.getToken(tokens.ETH); //this isn't asynch
      return token.allowance('0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002');
    })
    .then(allowance => {
      expect(allowance.toString(10)).toEqual(Number.MAX_SAFE_INTEGER.toString(10));
      done();
    });
});

