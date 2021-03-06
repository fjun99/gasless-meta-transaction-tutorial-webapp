import React, { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { Contract } from "@ethersproject/contracts";
import { Button, NumberInput, NumberInputField, FormControl, FormLabel, Text, Link, Heading } from '@chakra-ui/react'
import { BadgeTokenABI } from "abi/BadgeTokenABI"
import { TransactionResponse, TransactionReceipt } from "@ethersproject/providers"


interface Props {
    addressContract: string
}

enum CHECK_AVAILABLE {
  Uncheck,
  Checking,
  Available,
  UnAvailable
}

enum MINT_STATUS{
  Normal,
  Pending,
  Success
}

export default function MintNFT(props:Props){
  const addressContract = props.addressContract
  const [tokenId,setTokenId]=useState<number>(0)
  const [statusTokenCheck,setStatusTokenCheck] = useState<CHECK_AVAILABLE>(CHECK_AVAILABLE.Uncheck)
  const [statusMint, setStatusMint] = useState< MINT_STATUS>(MINT_STATUS.Normal)

  const { account, active, library} = useWeb3React<Web3Provider>()

  async function mint(event:React.FormEvent) {
    event.preventDefault()
    if(!(active && account && library)) return

    const token = new Contract(addressContract, BadgeTokenABI, library.getSigner());
    token.mintTo(tokenId).then((response:TransactionResponse)=>{

      setStatusMint(MINT_STATUS.Pending)
      
      setStatusTokenCheck(CHECK_AVAILABLE.Uncheck)

      console.log(response)//can we use response.wait() here?

    })
    .catch('error', console.error)
  }



  const handleChange = (value:string) => {
    let num = Number(value)
    if(num >= 1000) num =999

    setTokenId(num)
    setStatusTokenCheck(CHECK_AVAILABLE.Uncheck)
    setStatusMint(MINT_STATUS.Normal)
    // console.log(num)
  }



  const checkAvailable = (event:React.FormEvent)=>{
    event.preventDefault()

    if(!(active && account && library)) return

    setStatusTokenCheck(CHECK_AVAILABLE.Checking)

    const token = new Contract(addressContract, BadgeTokenABI, library);

    library.getCode(addressContract).then((result:string)=>{
      //check whether it is a contract
      if(result === '0x') return

      token.ownerOf(tokenId).then((result:string)=>{

        setStatusTokenCheck(CHECK_AVAILABLE.UnAvailable)

      }).catch((Error: any)=>{
        console.log(Error)

        setStatusTokenCheck(CHECK_AVAILABLE.Available)

      })

    })

    console.log("checkAvailable")
  }


useEffect(() => {
    if(statusMint != MINT_STATUS.Pending) return

    if(!(active && account && library)) return

    const token = new Contract(addressContract, BadgeTokenABI, library);

    // listen for changes on an Ethereum address
    console.log(`listening for Transfer...`)

    const toMe = token.filters.Transfer(null, account)
    token.on(toMe, (from, to, amount, event) => {
        console.log('Transfer|received', { from, to, amount, event })
        setStatusMint(MINT_STATUS.Success)

        // mutate(undefined, true)
    })

    // remove listener when the component is unmounted
    return () => {
        token.removeAllListeners(toMe)
    }
    
  }, [statusMint])




  const renderCheckSwitch =(param:CHECK_AVAILABLE)=> {
    switch(param) {
      case CHECK_AVAILABLE.Available:
        return '???????????? tokenID ??????';
      case CHECK_AVAILABLE.UnAvailable:
        return '???????????? tokenID ?????????';
      case CHECK_AVAILABLE.Checking:
        return '??????????????????????????????...';
      default:
        return '???????????????????????? ???tokenID ???????????????????????????';
    }
  }  



  const renderMintSwitch =(param:MINT_STATUS)=> {
    switch(param) {
      case MINT_STATUS.Pending:
        return 'Pending Mint NFT???????????????';
      case MINT_STATUS.Success:
        return 'Sucess Mint NFT??????';
      default:
        return 'mint ??????????????? Opensea ????????????????????? tokenID ?????? mint ????????????????????????';
    }
  }  



  return (
    <div>
      <Heading my={4}  fontSize='3xl' as='h2'>Mint NFT </Heading>
      <Text fontSize='md' mb={8}>???????????? ???? Web3Elite (WE) NFT ????????????? Polygon ??? NFT ??????????????????????????????</Text>

      <form onSubmit={mint}>
        <FormControl>
          <FormLabel mb={4} fontSize='xl' >?????? 0-999 ??????????????? </FormLabel>
          <FormLabel mb={4} >???????????????????????? NFT ??? tokenID???????????????????????? NFT ?????????????????????????????? mint??? </FormLabel>

            <NumberInput size='lg' maxW={32}  my={2} 
              defaultValue={tokenId} value ={tokenId} onChange={handleChange}  >
              <NumberInputField />
            </NumberInput>

            <FormLabel mt={8} fontSize='xl'>1. ????????? tokenID ???????????? </FormLabel>

            <Button my={2} size='lg' onClick={checkAvailable} isDisabled={!account }>
                Check
            </Button>

            <Text mb={4} >{renderCheckSwitch(statusTokenCheck)} </Text>

            <FormLabel mt={8} fontSize='xl' >2. ?????? Mint NFT????????????????????? MATIC???  </FormLabel>

            <Button my={2} type="submit" size='lg' colorScheme='messenger' isDisabled={!account  }>
                Mint NFT
            </Button>

            <Text mb={4} >{renderMintSwitch(statusMint)} </Text>
            <Link href='https://opensea.io/collection/web3elite-v2' isExternal color='teal.500'>
            OpenSea ?????? Web3Elite NFT ( ?????? mint ??????????????????????????????????????? Opensea ????????????)
            </Link>
        </FormControl>
      </form>
    </div>
  )
  
}
