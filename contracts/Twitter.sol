// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Twitter{

    address owner;

    uint16   maxTweetLength =300;

// defining a constructor
    constructor() {
        owner= msg.sender;
    }
    //  Defining a tweet struct 



    struct Tweet {
        address author;
        uint256 id;
        string content;
        uint256 timestamp;
        int likes;
    }
    
    mapping (address => Tweet[]) public tweets;

// Create the events
    event TweetCreated(address indexed author, uint256 indexed  id, uint256 timestamp,string content);
    event TweetLiked(address indexed  liker,address indexed  tweet_author, uint256   tweet_id, int newLikeCount);


    function createTweet(string memory content) public {

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

    modifier  onlyOwner{
        require(msg.sender == owner, "Only owner is allowed but you are not the owner");
        _;
    }


    // Changing the length of the maximum length of the tweet
    function changeMaxLength(uint16 newMaxLength) public onlyOwner{
     maxTweetLength= newMaxLength;
    }


    function getTweet(address _owner, uint i) public view  returns (Tweet memory){
        return tweets[_owner][i];
    }

    function getTweets(address _owner ) public view  returns (Tweet[] memory) {
        return  tweets[_owner];
    } 
    
    function addLikeToTweet(uint256 id, address author ) external {
        require(tweets[author][id].id == id,"Tweet doesn't exist");
        tweets[author][id].likes++;


// Emit the tweet liked event 

  emit TweetLiked(msg.sender, author,id,tweets[author][id].likes);
    }


    function unlikeTweet(uint256 id, address author ) external {
        require(tweets[author][id].id == id,"Tweet doesn't exist");
        require(tweets[author][id].likes > 0,"Tweet has no likes");
        tweets[author][id].likes--;
    }


   
}