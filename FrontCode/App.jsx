import React, { useEffect, useState } from "react";
import './App.css';
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";

export default function App() {
  const contractAddress = "0xCAFc0Ff1ae3034bFfbBb100C6E04CAAc3172c2B2";
  const contractABI = abi.abi;
  const [currentAccount, setCurrentAccount] = useState("");
  const [message, setMessage] = useState("");
  const [ethereumWindow, setEthereumWindow] = useState({});
  const [countWave, setCountWave] = useState(0);
  const [data, setAllWaves] = useState(null);

  const checkIfWalletIsConnect = async () => {
    const { ethereum } = window;
    console.log("tenemos el eth", ethereum);
    try {

      if (!ethereum) {
        console.log("error");
        return;
      } else {
        console.log("object ether", ethereum);
        setEthereumWindow(ethereum);
      }

      // verificar el acceso a la wallet

      const accounts = await ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account);
        } else {
          console.log("No estamos autorizados");
        }
      });
    } catch (error) {
      console.log("error en la transaccion", error);
    }
  }


  // Connect wallet Method

  const connectWallet = async () => {

    try {
      if (!ethereumWindow) {
        alert("error");
        return;
      }

      const account = await ethereum.request({ method: "eth_requestAccounts" });
      if (account.length !== 0) {
        console.log("Connected", account[0]);
        setCurrentAccount(account[0]);
      } else {
        console.log("no authorized account")
      }

    } catch (error) {
      console.log("error conectarndo la waller", error);
    }
  }


  // Check initial data 

  const countInitialWave = async () => {
    try {

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        setCountWave(count.toNumber());
        const waves = await wavePortalContract.getAllWaves();
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.account,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State order ascending
         */

        const listSort = wavesCleaned.sort((a, b) => {
          return a.timestamp > b.timestamp ? -1 : 1;
        });
        setAllWaves(listSort);
        wavePortalContract.on("NewWave", (from, timestamp, message) => {
          countInitialWave();
        });
      }
    } catch (error) {
      console.log(error)
      alert("No estas en una plataforma habilitada")
    }
  }
  // Llamar el contrato 
  const wave = async () => {
    try {

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        // saludar 

        const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
        setMessage("");
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        let count = await wavePortalContract.getTotalWaves();
        setCountWave(count.toNumber());
        await countInitialWave();

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
      alert("Calma Wey, enviaste muchos mensajes seguidos, espera 15 segundos")
    }
  }
  const setInput = (event) => {
    setMessage(event.target.value);
  }
  const logout = () => {
    setCurrentAccount("");
  }

  useEffect(() => {
    checkIfWalletIsConnect();
    countInitialWave();
  }, [])

  return (
    <div className="chainContainer">
      <div className="lineHeader" ></div>
      <div className="dataContainer">

        {currentAccount && (<div className="divAccount">
          <p className="account">Account connect: {currentAccount}</p>
          <p onClick={logout}>Logout</p>
        </div>
        )}
        <div className="header">
          👋 Hey there!
        </div>

        <div className="bio">
          I am Cris and I work on build web3 pages to learn and teach this topic so that's pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>
        <br></br>
        <div>
          <label>Write me a message or send me your favorite song link 🎶 🎶 </label>
          <br></br>
          <input value={message} onChange={setInput} className="inputClass"></input>
        </div>
        {currentAccount && (<button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        )}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {currentAccount && (<h5>Total Waves: {countWave}</h5>)}
        <div className="containerList">
          {data && data.map((wave, index) => {
            return (
              <div className="cards" key={index} >
                <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Message: {wave.message}</div>
              </div>)
          })}
        </div>
      </div>
    </div>
  );
}
