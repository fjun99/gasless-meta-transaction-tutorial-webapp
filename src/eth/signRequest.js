const typesForwardRequest = {
  ForwardRequest: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'gas', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'data', type: 'bytes' },
  ]
};

async function buildRequest(forwarder, inputData) {
  const nonce = await forwarder.getNonce(inputData.from).then(nonce => nonce.toString());

  return { 
    value: 0, 
    gas: 1e6, 
    nonce, 
    ...inputData };
}

async function signMetaTxRequest(signer, forwarder, inputData) {

  const request = await buildRequest(forwarder, inputData);

  const chainId = await forwarder.provider.getNetwork().then(n => n.chainId);

  const domain = {
    name: 'MinimalForwarder',
    version: '0.0.1',
    chainId: chainId,
    verifyingContract: forwarder.address,
  };

  const signature = await signer._signTypedData(
    domain,
    typesForwardRequest,
    request
  )

  return { signature, request };
}

module.exports = { 
  signMetaTxRequest,
};
