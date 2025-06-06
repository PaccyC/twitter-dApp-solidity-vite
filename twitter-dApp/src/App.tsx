import { useEffect, useState } from "react";
import Web3 from "web3";
import contractABI from "./abi.json";
import { IoMdHeart } from "react-icons/io";
import { IoMdHeartEmpty } from "react-icons/io";


const contractAddress = "0x49a2600c958a15b45b3C75B082aB80E890948aEB";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Tweet {
  author: string;
  id: number;
  content: string;
  timestamp: number;
  likes: number;
}

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [tweetContent, setTweetContent] = useState("");
  const [tweets, setTweets] = useState<Tweet[]>([]);

const fetchTweets = async () => {
    if (!contract || !account) return;

    try {
      const rawTweets = await contract.methods.getTweets(account).call();
      
      const mappedTweets = rawTweets.map((tweet: any) => ({
        author: tweet[0],
        id: parseInt(tweet[1]),
        content: tweet[2],
        timestamp: parseInt(tweet[3]),
        likes: parseInt(tweet[4]),
      }));

      setTweets(mappedTweets);
    } catch (err) {
      console.error('Error fetching tweets:', err);
    }
  };


  const handleTweetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tweetContent.trim() || !contract || !account) return;
    try {
      await contract.methods.createTweet(tweetContent).send({ from: account });
      setTweetContent("");
      await fetchTweets(); 
    } catch (error) {
      console.error("Error sending tweet:", error);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      const contractInstance = new web3Instance.eth.Contract(
        contractABI as any,
        contractAddress
      );
      setContract(contractInstance);
    }
  }, []);

  const connectWallet = async () => {
    if (window.ethereum && window.ethereum.isMetaMask && web3) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",

        });
        setAccount(accounts[0]);

        // Fetch tweets for the connected account
        if (contract) {
          const tweetData = await contract.methods.getTweets(accounts[0]).call();
          setTweets(tweetData);
        }
      } catch (err) {
        console.error("Wallet connect error:", err);
      }
    }
  };

function formatTimestamp(timestamp: bigint | number | string) {
  const time = typeof timestamp === 'bigint' ? Number(timestamp) : +timestamp;
  return new Date(time * 1000).toLocaleString();
}

  const handleLike = async ( id: number,author: string) => {
    
    try {
      await contract.methods.addLikeToTweet(id, author).send({ from: account });
      fetchTweets();
    } catch (err) {
      console.error('Error liking tweet:', err);
    }
  };

  return (
    <div className="container">
      <h1>Twitter dApp</h1>

      <div className="connect">
        <button id="connectWalletBtn" onClick={connectWallet}>
          Connect Wallet
        </button>
        {account && <div id="userAddress">{account}</div>}
      </div>

      {!account && (
        <div id="connectMessage">Please connect your wallet to tweet.</div>
      )}

      {account && (
        <form id="tweetForm" onSubmit={handleTweetSubmit}>
          <textarea
            id="tweetContent"
            rows={4}
            placeholder="What's happening?"
            value={tweetContent}
            onChange={(e) => setTweetContent(e.target.value)}
          ></textarea>
          <br />
          <button id="tweetSubmitBtn" type="submit">
            Tweet
          </button>
        </form>
      )}

      <div id="tweetsContainer">
        <h2>Your Tweets</h2>
        {tweets.length === 0 && <p>No tweets yet.</p>}
        {tweets.map((tweet, index) => (
          <div key={index} className="tweetCard" style={{ border: "1px solid #ccc", margin: "10px 0", padding: "10px" }}>
            <p><strong>Author:</strong> {tweet.author}</p>
            <p>{tweet.content}</p>
            <p><small>{formatTimestamp(tweet.timestamp)}</small></p>

            <p className="w-full flex gap-3 items-center">{tweet.likes > 0 ? <IoMdHeart/> : <IoMdHeartEmpty className="cursor-pointer" onClick={()=>handleLike(tweet.id,tweet.author)} size={24} fill="#1da1f2"/> }<span> {tweet.likes}</span></p>

          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
