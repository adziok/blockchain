import "./App.css";
import { useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import addresses from "./blockchain/deployment.json";
import LeocodeToken from "./blockchain/LeocodeToken.json";
import LEON from "./blockchain/LEON.json";
import USDT from "./blockchain/USDT.json";
import Marketplace from "./blockchain/Marketplace.json";
import { useInput } from "./hooks";

// {
//   leo: any,
//   leon: any,
//   market: any,
//   usdt: any,
// }

function App() {
  // {
  //   leo: any,
  //   leon: any,
  //   market: any,
  //   usdt: any,
  // }
  const [nfts, setNfts] = useState([]);
  const [tokens, setTokens] = useState({});
  const [error, setError] = useState(null);
  const [address, setAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [leoTokenAmount, leoSetTokenAmount] = useState(null);
  const [usdtTokenAmount, usdtSetTokenAmount] = useState(null);
  // const [leoTokenAmount, leoSetTokenAmount] = useState(null);
  const { onChange, value: gimmeTokenAmount } = useInput(0);

  const refresh = async (_signer) => {
    const leoTokens = await tokens.leo.balanceOf(await _signer.getAddress());
    const _leoFormattedTokens = ethers.utils.formatUnits(leoTokens, 18);
    const usdtTokens = await tokens.usdt.balanceOf(await _signer.getAddress());
    const _usdtFormattedTokens = ethers.utils.formatUnits(usdtTokens, 6);

    leoSetTokenAmount(_leoFormattedTokens);
    usdtSetTokenAmount(_usdtFormattedTokens);
  };

  const buyLeo = (_token) => async (amount) => {
    await tokens.usdt.approve(
      tokens.market.address,
      BigNumber.from(
        BigNumber.from(BigNumber.from(amount).mul(BigNumber.from(10).pow(18)))
          .div(BigNumber.from(10).pow(12))
          .div(100)
      ).mul(3)
    );
    const tx = await tokens.market.buyLEOForUSDT(
      ethers.utils.parseUnits(amount, 18)
    );
    await tx.wait();
    await refresh(signer);
  };

  const gimmeUsdt = (_token) => async (amount) => {
    const tx = await _token.gimme(amount);
    await tx.wait();
    await refresh(signer);
  };

  const buyNftForUsdt = async (amount) => {
    await tokens.usdt.approve(
      tokens.market.address,
      BigNumber.from("15").mul(BigNumber.from(10).pow(6))
    );
    const tx = await tokens.market.buyNFTForUSDT(0);
    await tx.wait();
    await refresh(signer);
  };

  const buyNftForLeo = async (amount) => {
    await tokens.leo.approve(
      tokens.market.address,
      BigNumber.from("200").mul(BigNumber.from("10").pow(18))
    );
    const tx = await tokens.market.buyNFTForLEO(0);
    await tx.wait();
    await refresh(signer);
  };

  const sellNftForUsdt = async (amount) => {
    const tx = await tokens.market.sellNFTForUSDT(0);
    await tx.wait();
    await refresh(signer);
  };

  const sellNftForLeo = async (amount) => {
    const tx = await tokens.market.sellNFTForLEO(0);
    await tx.wait();
    await refresh(signer);
  };

  const sellLeo = (_token) => async (amount) => {
    const tx = await tokens.market.sellLEOForUSDT(
      ethers.utils.parseUnits(amount, 18)
    );
    await tx.wait();
    await refresh(signer);
  };

  const listNfts = async () => {
    console.log(await tokens.leon.balanceOf(tokens.market.address, 0));
  };

  const loadNfts = async () => {
    const amount = await tokens.leon.balanceOf(await tokens.market.owner(), 0);
    const jsonUrl = await tokens.leon.uri(0);
    const { image } = (
      await fetch(
        jsonUrl.replace(
          "{id}",
          "0000000000000000000000000000000000000000000000000000000000000001"
        ),
        { mode: "cors" }
      )
    ).json();

    setNfts(() => [{ url: image, amount: amount.toString() }]);
  };

  const connect = async () => {
    if (window.ethereum) {
      const _provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(_provider);

      await _provider.send("eth_requestAccounts", []);

      const { chainId } = await _provider.getNetwork();

      console.log("Network chain id: ", chainId);

      const _signer = await _provider.getSigner();
      setSigner(_signer);

      const _address = await _signer.getAddress();
      setAddress(_address);

      // read-only
      const _tokenLeo = new ethers.Contract(
        addresses.LEO,
        LeocodeToken.abi,
        _signer
      );
      const _tokenUsdt = new ethers.Contract(addresses.USDT, USDT.abi, _signer);
      const _tokenMarket = new ethers.Contract(
        addresses.MARKET,
        Marketplace.abi,
        _signer
      );
      const _tokenNft = new ethers.Contract(addresses.NFT, LEON.abi, _signer);
      setTokens(() => ({
        leo: _tokenLeo,
        leon: _tokenNft,
        market: _tokenMarket,
        usdt: _tokenUsdt,
      }));

      refresh(_signer);
    } else {
      setError("Missing wallet");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={() => connect()}>{address || "connect"}</button>
        <button onClick={() => refresh(signer)}>REFRESH</button>
        <hr />
        <div>
          <input value={gimmeTokenAmount} onChange={onChange} />
        </div>
        <button onClick={() => buyLeo(tokens.market)(gimmeTokenAmount)}>
          KUP
        </button>
        <button onClick={() => sellLeo(tokens.market)(gimmeTokenAmount)}>
          SELL
        </button>
        <button onClick={() => gimmeUsdt(tokens.usdt)(gimmeTokenAmount)}>
          DAJ USDT
        </button>
        <button onClick={() => listNfts(gimmeTokenAmount)}>list nfts</button>
        <hr />
        <button onClick={() => buyNftForLeo()}>buyNftForLeo</button>
        <button onClick={() => sellNftForLeo()}>sellNftForLeo</button>
        <hr />
        <button onClick={() => buyNftForUsdt()}>buyNftForUsdt</button>
        <button onClick={() => sellNftForUsdt()}>sellNftForUsdt</button>
        <hr />
        <button onClick={() => loadNfts()}>loadNfts</button>
        <div color={"red"}>{error}</div>
        <div>You have: {leoTokenAmount} LEO tokens</div>
        <div>You have: {usdtTokenAmount} USDT tokens</div>
        {nfts.map((nft) => {
          console.log(nft);
          return (
            <div>
              url: {nft.url}
              <hr />
              amount: {nft.amount}
            </div>
          );
        })}
      </header>
    </div>
  );
}

export default App;
