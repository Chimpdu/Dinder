const express = require('express');
const router = express.Router();
const verifyToken = require("../auth/verifyToken");
const User = require("../models/User")

/* api endpoint for validate token, httpOnly cookies can not be handled by js in the frontend, this api endpoint is necessary */
router.get("/auth", verifyToken, (req, res, next)=>{
    res.json({ isAuthenticated: req.isAuthenticated });
  })
router.get("/profile", verifyToken, async (req, res, next) => {
    /* verifyToken would put decoded jwt into req.user */
    const id = req.user.id;
    try {
        const userInfo = await User.findById(id);
        if (! userInfo) return res.json({"errors": ["Unknown error, unable to fetch your data"]});
        return res.send(userInfo);
    } catch (error) {
        next(error);
    }
    
    
   
});

/* A get request that randomly sends back a user */


// Route to find a random friend
router.get('/find_friend', verifyToken, async (req, res, next) => {
    try {
        const currentUserId = req.user.id; // Assuming this is a string that represents an ObjectId
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({ "errors": ["Login user not found."] });
        }


        // Extracting just the userIds from currentUser.likes array
        const likedUserIds = currentUser.likes.map(like => like.userId);
        // Ensure likedUserIds are in the correct format, if necessary
        // const formattedLikedUserIds = likedUserIds.map(id => new ObjectId(id)); // Only if necessary

        // Find users who are not the current user and not in the current user's likes array
        const potentialFriends = await User.find({
            $and: [
                { _id: { $ne: currentUserId } }, // Exclude the current user by their ID
                { _id: { $nin: likedUserIds } } // Exclude users already liked by the current user
            ]
        }).lean(); // Use .lean() for faster execution

        if (potentialFriends.length === 0) {
            return res.status(404).json({ message: "No potential friends found." });
        }

        
        // Select a random user from potential friends
        const randomIndex = Math.floor(Math.random() * potentialFriends.length);
        const randomFriend = potentialFriends[randomIndex];

        res.json(randomFriend);
    } catch (error) {
        next(error);
    }
});






/* POST Route to like a user */
router.post('/like_user', verifyToken, async (req, res, next) => {
    const likedUserId = req.body.likedUserId;
    const currentUserId = req.user.id;
    try {
        // Find the liked user to get their username
        const likedUser = await User.findById(likedUserId);
        if (!likedUser) {
            return res.status(404).json({ "errors": ["Liked user not found."] });
        }
       
        // Find the current user to get their username
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({ "errors": ["Current user not found."] });
        }

        // Add liked user to the current user's likes array
        await User.findByIdAndUpdate(currentUserId, {
            $addToSet: {
                likes: {
                    userId: likedUserId,
                    username: likedUser.username
                }
            }
        });

        // Add current user to the liked user's likedBy array
        await User.findByIdAndUpdate(likedUserId, {
            $addToSet: {
                likedBy: {
                    userId: currentUserId,
                    username: currentUser.username
                }
            }
        });

        res.json({ message: 'User liked successfully.' });
    } catch (error) {
        console.error('Error liking user:', error);
        res.status(500).json({ "errors": 'An error occurred while liking the user.' });
    }
});

/* GET request for deleting friend */
router.delete('/delete_friend/:friendId', verifyToken, async (req, res) => {
    const userId = req.user.id; // ID of the logged-in user
    const friendId = req.params.friendId; // ID of the friend to be deleted
  
    try {
      // Update the logged-in user's document to remove the friendId from the likes array
      await User.updateOne(
        { _id: userId },
        { $pull: { likes: { userId: friendId } } } // Specify the field within the object in the array
      );
      
      // Update the friend's document to remove the userId from the likedBy array
      await User.updateOne(
        { _id: friendId },
        { $pull: { likedBy: { userId: userId } } } // Specify the field within the object in the array
      );
  
      // If the updates are successful, send a success response
      res.json({ success: true, message: 'Friend successfully deleted' });
    } catch (error) {
      // If there's an error, send an error response
      res.status(500).json({ success: false, message: 'Failed to delete friend', error: error.message });
    }
  });


router.get('/messageable-users', verifyToken, async (req, res) => {
    const userId = req.user.id; // ID of the logged-in user
    const page = parseInt(req.query.page) || 0; // Current page number, default is 0
    const pageSize = parseInt(req.query.pageSize) || 10; // Page size, default is 10
  
    try {
        // Find the logged-in user's document
        const user = await User.findById(userId);
  
        // Extract the IDs of users the logged-in user has liked
        const userLikesIds = user.likes.map(like => like.userId);
  
        // Calculate the total number of messageable users
        const total = await User.countDocuments({
            'likes.userId': userId,
            '_id': { $in: userLikesIds }
        });
  
        // Find all users who have liked the logged-in user back with pagination
        const messageableUsers = await User.find({
            'likes.userId': userId,
            '_id': { $in: userLikesIds }
        })
        .skip(page * pageSize)
        .limit(pageSize)
        .lean();
  
        const filteredUsers = messageableUsers.map(({ username, nickname, _id }) => ({
            username,
            nickname,
            id: _id
        }));
  
        res.json({
            users: filteredUsers,
            currentPage: page,
            pageSize: pageSize,
            totalPages: Math.ceil(total / pageSize)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch messageable users', error: error.message });
    }
  });
module.exports = router;
