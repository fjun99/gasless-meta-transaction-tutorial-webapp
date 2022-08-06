// src/pages/index.tsx
import type { NextPage } from 'next'
import Head from 'next/head'
import { VStack, Heading, Box, Text} from "@chakra-ui/layout"
import { addressContract }  from '../constants'
// import MintNFT from 'components/MintNFT'
import MintNFTGasless from 'components/MintNFTGasless'
import ConnectMetamask from 'components/ConnectMetamask'

const Home: NextPage = () => {
  // const addressContract='0x5fbdb2315678afecb367f032d93f642f64180aa3'

  return (
    <>
      <Head>
        <title>Web3 Elites</title>
      </Head>

      <Heading as="h3"  my={4}>Web3 Elites - WE NFT</Heading> 
      <ConnectMetamask />

      <VStack >
        <Box  my={4} p={4} w='100%' borderWidth="1px" borderRadius="lg" >
          <MintNFTGasless addressContract={addressContract} />
        </Box>
        <Box  my={4} pt={0} pb={4} px={4} w='100%' >
          <Text fontSize="sm"> 说明: 你不能铸造重复的编号 (Token ID) ，请选择未被铸造的编号。</Text>
        </Box>        

        <Box  my={4} p={4} w='100%' >
          <Text> 成功后，可在 Opensea 查看：<a href="https://opensea.io/collection/web3elite-nft"> https://opensea.io/collection/web3elite-nft </a> </Text>
        </Box>

      </VStack>
    </>
  )
}

export default Home
