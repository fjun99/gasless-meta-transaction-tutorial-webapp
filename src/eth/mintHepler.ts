import { Web3Provider } from '@ethersproject/providers'
import { Contract } from "@ethersproject/contracts";
import { BadgeTokenABI } from "abi/BadgeTokenABI"
import { createFowarderInstance } from "./forwarderContract"
import { signMetaTxRequest } from "./signRequest"
import { addressContract }  from '../constants'

async function sendTx(token:Contract, tokenId:number) {
  console.log(`mintTo with tokenID=${tokenId}`);
  return token.mintTo(tokenId);
}

async function sendMetaTx(token:Contract,  tokenId:number, provider:Web3Provider, account:string) {
  console.log(`mintTo using meta-tx with tokenID ${tokenId}`);

  const url = process.env.NEXT_PUBLIC_WEBHOOK_URL;
  if (!url) throw new Error(`Missing relayer url`);

  const forwarder = createFowarderInstance(provider);
  const from = account;
  const data = token.interface.encodeFunctionData('mintTo', [tokenId]);
  const to = token.address;
  
  const requestwithsignature = await signMetaTxRequest(provider.getSigner(), forwarder, { to, from, data });
  
  //call openzeppelin defender relayer/autotask webhook url
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(requestwithsignature),
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function helperMint(provider:Web3Provider,account:string, tokenId:number) {
  const token = new Contract(addressContract, BadgeTokenABI, provider.getSigner());
  
  const balance = await provider.getBalance(account);
  const canSendTx = balance.gt(1e15);
  if (canSendTx) {
    return sendTx(token,tokenId)
  } else{
    return sendMetaTx(token, tokenId,provider,account)
  } 
}

export async function checkAvailable(provider:Web3Provider, tokenId:number): Promise<Boolean> {

  const token = new Contract(addressContract, BadgeTokenABI, provider); 

  const availabe = await token.ownerOf(tokenId)
        .catch((error:any)=>{
          // if(! error.message.includes("ERC721: owner query for nonexistent token")) {
          //   return false
          // }
          return false
        })
  
  return (! availabe)
}
