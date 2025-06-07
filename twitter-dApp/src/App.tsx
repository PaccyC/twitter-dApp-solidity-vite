import { useEffect, useState } from "react";
import Web3 from "web3";
import contractABI from "./contracts/abi.json";
import profileABI from "./contracts/user.json";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import ProfileCreation from "./components/ProfileCreation";

const contractAddress = "0x6e17c0d8A1bF7A1cf7f39d6bb3dcE993Efa85C4f";
const profileContractAddress = "0x74C877e2fAb46aC42f22d8287105180fB3CBDb41"; 

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
  const [profileContract, setProfileContract] = useState<any>(null);
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [walletConnected,setWalletConnected]=useState<boolean>(false)

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

  const getProfile = async (): Promise<boolean> => {
    if (!web3 || !profileContract || !account) return false;
    try {
      const profile = await profileContract.methods.getProfile(account).call();
      return profile.displayName !== "";
    } catch (error) {
      console.error("Error checking profile existence:", error);
      return false;
    }
  };

  const checkProfile = async () => {
    const exists = await getProfile();
    setProfileExists(exists);
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

  const connectWallet = async () => {
    if (window.ethereum && window.ethereum.isMetaMask && web3) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        if (contract) {
          await fetchTweets();
        }
        await checkProfile();
      } catch (err) {
        console.error("Wallet connect error:", err);
      }
    }
  };

  const handleLike = async (id: number, author: string) => {
    try {
      await contract.methods.addLikeToTweet(id, author).send({ from: account });
      fetchTweets();
    } catch (err) {
      console.error('Error liking tweet:', err);
    }
  };


  const formatTimestamp = (timestamp: number | bigint | string) => {
    const time = typeof timestamp === 'bigint' ? Number(timestamp) : +timestamp;
    return new Date(time * 1000).toLocaleString();
  };

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      const twitterInstance = new web3Instance.eth.Contract(
        contractABI as any,
        contractAddress
      );
      const profileInstance = new web3Instance.eth.Contract(
        profileABI as any,
        profileContractAddress
      );

      setContract(twitterInstance);
      setProfileContract(profileInstance);
    }
  }, []);

  return (
    <div className="container">
      <h1>Twitter dApp</h1>

      <div className="connect">
        <button className="bg-[#1da1f2] text-white border-none py-3 px-5 rounded-xl cursor-pointer mt-3" onClick={connectWallet}>Connect Wallet</button>
        {account && <div>{account}</div>}
      </div>

      {!account && <div>Please connect your wallet to tweet.</div>}

      {account && profileExists === false && profileContract && (
        <ProfileCreation
          checkProfile={checkProfile}
          profileContract={profileContract}
          account={account}
        />
      )}

      {account && profileExists && (
        <>
          <form onSubmit={handleTweetSubmit}>
            <textarea
              rows={4}
              placeholder="What's happening?"
              value={tweetContent}
              onChange={(e) => setTweetContent(e.target.value)}
            ></textarea>
            <br />
            <button type="submit">Tweet</button>
          </form>

          <div>
            <h2>Your Tweets</h2>
            {tweets.length === 0 && <p>No tweets yet.</p>}
            {tweets.map((tweet, index) => (
              <div key={index} className="tweetCard" style={{ border: "1px solid #ccc", margin: "10px 0", padding: "10px" }}>
                <p><strong>Author:</strong> {tweet.author}</p>
                <p>{tweet.content}</p>
                <p><small>{formatTimestamp(tweet.timestamp)}</small></p>
                <p className="flex items-center gap-2">
                  {tweet.likes > 0
                    ? <IoMdHeart />
                    : <IoMdHeartEmpty className="cursor-pointer" onClick={() => handleLike(tweet.id, tweet.author)} size={24} fill="#1da1f2" />
                  }
                  <span>{tweet.likes}</span>
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
