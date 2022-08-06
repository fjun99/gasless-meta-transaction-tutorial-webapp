import React, { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { Contract } from "@ethersproject/contracts";
import { Button, NumberInput, NumberInputField, FormControl, Heading, Progress } from '@chakra-ui/react'
import { BadgeTokenABI } from "abi/BadgeTokenABI"
import { useToast } from '@chakra-ui/react'
import { helperMint, checkAvailable } from "../eth/mintHepler"

interface Props {
    addressContract: string
}

//metamask error
interface ProviderRpcError extends Error { 
  message: string;
  code: number;
  data?: unknown;
}

export default function MintNFTGasless(props:Props){
  const toast = useToast()

  const addressContract = props.addressContract
  const [tokenId,setTokenId]=useState<number>(0)

  const [isMinting, setIsMinting] = useState(false)

  const { account, active, library} = useWeb3React<Web3Provider>()
  const provider = library

  async function mint(event:React.FormEvent) {
    event.preventDefault()
    toast.closeAll()

    if(!(active && account && provider)) return

    const available = await checkAvailable(provider,tokenId)

    if (! available){
      toast({
        title: "Token Id is already taken",
        status: 'error',
        isClosable: true,
      })
      return      
    }

    setIsMinting(true)

    helperMint(provider, account, tokenId)
    .then(()=>{
      // do nothing here, and will listen to transfer event
    }).catch((error:ProviderRpcError)=>{
      // console.error
      setIsMinting(false)
    })
  
  }

  const handleChange = (value:string) => {
    let num = Number(value)
    // if(num >= 1000) num =999

    setTokenId(num)
  }

  useEffect(() => {
    if(isMinting != true) return

    if(!(active && account && provider)) return

    const token = new Contract(addressContract, BadgeTokenABI, provider);

    // listen for changes on an Ethereum address
    console.log(`listening for Transfer...`)

    const toMe = token.filters.Transfer(null, account)
    token.on(toMe, (from, to, tokenId, event) => {
        console.log('Transfer|received', { from, to, tokenId, event })

        setIsMinting(false)
        toast.closeAll()
        toast({
          title: `Mint NFT ${tokenId} succeed`,
          status: 'success',
          duration: null,//20000
          isClosable: true,
          position:'top'
        })        

    })

    // remove listener when the component is unmounted
    return () => {
        token.removeAllListeners(toMe)
        console.log(`listening for Transfer... Listener removed`)
    }    
  }, [isMinting])

  return (
    <div>
      <Heading my={4}  fontSize='3xl' as='h2'>Mint NFT </Heading>
      <form onSubmit={mint}>
        <FormControl>
          <NumberInput size='lg' maxW={32}  my={2} isRequired = {true} isReadOnly = {isMinting}
              defaultValue={tokenId} value ={tokenId} onChange={handleChange} max={999} keepWithinRange={true}>
              <NumberInputField />
          </NumberInput>

          <Button my={2} type="submit" size='lg' colorScheme='messenger' 
            isDisabled={!account || isMinting }>
              { isMinting  ? 'minting...' : 'Mint NFT'}               
          </Button>

          <Progress size='xs' isIndeterminate={isMinting} hidden={!isMinting}/>
        </FormControl>
      </form>
    </div>
  )

}
