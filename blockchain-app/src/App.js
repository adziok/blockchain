import "./App.css";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import LEOAddress from "./blockchain/LecodeTokenAdrress.json";
import LEO from "./blockchain/LeocodeToken.json";
import { useInput } from "./hooks";

function App() {
  const [error, setError] = useState(null);
  const [address, setAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [token, setToken] = useState(null);
  const [tokenAmount, setTokenAmount] = useState(null);
  const { onChange, value: gimmeTokenAmount } = useInput(0);

  const refresh = async (_token, _signer) => {
    const tokens = await _token.balanceOf(await _signer.getAddress());
    const _formattedTokens = ethers.utils.formatUnits(tokens, 18);

    setTokenAmount(_formattedTokens);
  };

  const gimme = (_token) => async (amount) => {
    const tx = await _token.gimme(amount + "");
    await tx.wait();
    await refresh(token, signer);
  };

  const buy = (_token) => async (amount) => {
    const tx = await _token.buy({
      value: ethers.utils.parseUnits(amount + "", 18),
    });
    await tx.wait();
    await refresh(token, signer);
  };

  const payMeUp = (_token) => async () => {
    const tx = await _token.payMeUp();
    await tx.wait();
    await refresh(token, signer);
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
      const _token = new ethers.Contract(LEOAddress.address, LEO.abi, _signer);
      setToken(_token);

      refresh(_token, _signer);
    } else {
      setError("Missing wallet");
    }
  };

  useEffect(() => {}, []);

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={() => connect()}>{address || "connect"}</button>
        <button onClick={() => refresh(token, signer)}>REFRESH</button>
        <hr />

        <div>
          <input value={gimmeTokenAmount} onChange={onChange} />
        </div>
        <button onClick={() => gimme(token)(gimmeTokenAmount)}>DEJ</button>
        <button onClick={() => buy(token)(gimmeTokenAmount)}>KUP</button>
        <button onClick={() => payMeUp(token)()}>WYPŁAC</button>
        <hr />
        <div color={"red"}>{error}</div>
        <div>You have: {tokenAmount} LEO tokens</div>
      </header>
    </div>
  );
}

export default App;
