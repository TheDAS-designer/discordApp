import { Web3Button } from '@web3modal/react'
import { useAccount, useNetwork, useSignMessage, useSwitchNetwork } from 'wagmi'
import { useEffect, useState } from 'react'
import { sign } from '../api/sign'
import { setStorage, getStorage, isSupportWindow } from '../utils/storagerUtil'
import { useSearchParams } from "react-router-dom";

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const { isConnected, address } = useAccount()
  const { chain } = useNetwork()
  const { chains, error, isLoading, pendingChainId, switchNetwork } =
    useSwitchNetwork()
  const [isSuccess , setIsSuccess] = useState(false)
  const [count, setCount] = useState(5)

  useEffect(()=>{
    if(!isSuccess) return
    setInterval( ()=> setCount(c => --c),1000)
  }, [
    isSuccess
  ])
  // const { open } = useWeb3Modal()
  const discordId = searchParams.get('discordId')
    ? searchParams.get('discordId')
    : getStorage('userInfo')
    ? getStorage('userInfo').discordId
    : ''
  const discordUserName = searchParams.get('discordUserName')
    ? searchParams.get('discordUserName')
    : getStorage('userInfo')
    ? getStorage('userInfo').discordUserName
    : ''
  // let { discordId, discordUserName } = useParams()
  useEffect(() => {
    if (discordId) {
      console.log('discordId', discordId)
    }
  }, [discordId])
  const signMessage = useSignMessage()

  useEffect(() => {
    if (!isConnected) return
    if (!signMessage) return
    if (!discordId || !discordUserName) return
    if (!isSupportWindow()) return
    signMessage
      .signMessageAsync({
        message: `
purpose:\tVerify address

discordId:\t${discordId}

discordName:\t${discordUserName}

owner:\t${address}`,
      })
      .then((result) => {
        setStorage('userInfo', { discordId, discordUserName })
        console.log('result:', result)
        sign({ sign: result, discordUserName, discordId, address }).then(
          (r) => {
            console.log("r:", r)
            console.log("r.data:", r.data.msg)
            console.log("r.data == 0:", r.data.msg === 0)
            if(r && r.data.msg === 0) {
              setIsSuccess(true)
              setTimeout(() => {
                window.close()
              }, 5000);
            }
          },
        )
      })
      .catch((err) => {
        console.error('err:', err)
      })
  }, [isConnected, isSupportWindow, discordId, discordUserName])
  return (
    <>
    
      {!isSuccess  && <>
        <div>
          <h1>Sign message</h1>
        </div>
        <Web3Button />
      </> 
      }

      {/* <Euck address={address} discordId={"234"} discordUserName={"123"} isConnected={isConnected}/> */}
      {/* <button></button> */}

      {isSuccess && <>
        <div>
          <h1>Success!!</h1>
          <p>{`Auto close(${count})`}</p>
        </div>
      </>}
    </>
  )
}
