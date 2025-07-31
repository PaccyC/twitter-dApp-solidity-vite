// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/access/Ownable.sol";


interface IProfile {
    struct UserProfile {
        string displayName;
        string bio;
    }
    function getProfile(address _profileOwner) external  view returns (UserProfile memory);
    
}

contract Twitter is Ownable{

    uint16   maxTweetLength =300;
    struct Tweet {
        address author;
        uint256 id;
        string content;
        uint256 timestamp;
        uint likes;
    }
    
    mapping (address => Tweet[]) public tweets;

    // profile contract defined here 
    IProfile profileContract;

// Create the events
    event TweetCreated(address indexed author, uint256 indexed  id, uint256 timestamp,string content);
    event TweetLiked(address indexed  liker,address indexed  tweet_author, uint256   tweet_id, uint newLikeCount);

   modifier onlyRegistered(){
        IProfile.UserProfile memory userProfileTemp = profileContract.getProfile(msg.sender); 
        
        require(bytes(userProfileTemp.displayName).length > 0, "User is not registered yet");
        _;

    }

  constructor() Ownable(msg.sender){}

    function createTweet(string memory content) public onlyRegistered(){

        require(bytes(content).length <= maxTweetLength,"Your tweet is too long");

        Tweet memory newTweet= Tweet({
            author:msg.sender,
            id:tweets[msg.sender].length,
            content:content,
            timestamp:block.timestamp,
            likes:0
        });

        tweets[msg.sender].push(newTweet);

        // Emit the event
        emit TweetCreated(newTweet.author, newTweet.id, block.timestamp, content);
    }



    // Changing the length of the maximum length of the tweet
    function changeMaxLength(uint16 newMaxLength) public onlyOwner{
     maxTweetLength= newMaxLength;
    }


    function getTweet(address _owner, uint i) public view  returns (Tweet memory){
        return tweets[_owner][i];
    }

    function getTweets(address _owner ) public view  returns (Tweet[] memory)  {
        return  tweets[_owner];
    } 
    
    function addLikeToTweet(uint256 id, address author ) external  onlyRegistered(){
        require(tweets[author][id].id == id,"Tweet doesn't exist");
        tweets[author][id].likes++;


    
// Emit the tweet liked event 

  emit TweetLiked(msg.sender, author,id,tweets[author][id].likes);
    }


    function unlikeTweet(uint256 id, address author ) external onlyRegistered(){
        require(tweets[author][id].id == id,"Tweet doesn't exist");
        require(tweets[author][id].likes > 0,"Tweet has no likes");
        tweets[author][id].likes--;
    }

    function getTotalTweets (address _author) external view  returns (uint){

        uint totalLikes;
        for (uint i=0; i < tweets[_author].length; i++) 
        {
            totalLikes += tweets[_author][i].likes;
        }
        return   totalLikes;
    }



   
}