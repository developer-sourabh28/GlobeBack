const express = require('express');
const router = express.Router();
const Quote = require('../schema/quoteSchema')
const uploads = require('../configure/images')
const authMiddleWare = require('../middleware/authMiddleware')
const verifyOwnership = require('../middleware/verifyOwnership');
const verifyToken = require('../middleware/verifyToken');
const Comment = require('../schema/CommentSchema');

router.post ( '/', async(req, res) => {
    try {
        const quote = new Quote({
          theme : req.body.theme,
          quote : req.body.quote,
          writer : req.body.writer,
          imageUrl : req.body.imageUrl,
          user: req.body.userId,
          likes: [],
        });
        const savedQuote = await quote.save();
        res.status(200).json(savedQuote)
    } catch (error) {
        res.status(500).json({message : error.message})
    }
});

router.get('/test', (req, res) => {
    res.send('QuoteRoute is working!');
});


router.patch('/quote/:id/like', authMiddleWare, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId; // User ID from the token

    console.log('Request Path:', req.originalUrl);  // Logs the full URL, including the dynamic ID
    console.log('Quote ID:', id); // Logs just the dynamic ID
    console.log('User ID from token:', req.user?.userId);

    try {
        const quote = await Quote.findById(id).populate('user');

        if (!quote) {
            return res.status(404).json({ message: 'Quote not found' });
        }

        // Like/dislike logic (example: toggle functionality)
        if (quote.likes.includes(userId)) {
            await Quote.findByIdAndUpdate(id, { $pull: { likes: userId } });
        } else {
            await Quote.findByIdAndUpdate(id, { $addToSet: { likes: userId } });
        }
        

        await quote.save();

        return res.status(200).json({ likes: quote.likes.length });
    } catch (error) {
        alert(error.message);
        return res.status(500).json({ message: error.message });
    }
});

router.post('/uploads', uploads.single('image'), (req, res) => {
    try {
        if(!req.file){
            return res.status(400).json({message : 'No file uploaded'})
        }
        const filePath = `/uploads/${req.file.filename}`;
        res.status(200).json({
            message : 'Image Uploades Successfully',
            url : `http://localhost:8000${filePath}`,      
        });
    } catch (error) {
        res.status(500).json({message : error.message});
    }
})

router.post('/:quoteId/comments', async (req, res) => {
    try {
      // Extract the token from the Authorization header
      const token = req.headers.authorization?.split(' ')[1]; // Get token from header
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }
  
      // Decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify and decode token
      const userId = decoded.id; // Assuming the user ID is in the token
  
      console.log("Decoded Token:", decoded);  // Log the decoded token to verify its structure
      console.log("User ID from Token:", userId); // Log the user ID to make sure it's correct
  
      // Check that userId is not undefined or null
      if (!userId) {
        return res.status(400).json({ message: 'User ID not found in token' });
      }
  
      const { text } = req.body; // Get the comment text from the request body
  
      if (!text) {
        return res.status(400).json({ message: 'Comment text is required' });
      }
  
      // Create the new comment with user and quote references
      const newComment = new Comment({
        text,
        user: userId, // User reference from decoded token
        quote: req.params.quoteId, // Quote reference from the URL parameter
      });
  
      // Save the comment to the database
      const savedComment = await newComment.save();
  
      // Optionally populate the user details if you want to send the username
      const populatedComment = await Comment.populate(savedComment, {
        path: 'user',
        select: 'username', // You can select fields from the User model
      });
  
      res.status(201).json(populatedComment); // Respond with the saved comment
    } catch (error) {
      console.error("Error while adding comment:", error);
      res.status(500).json({ message: 'Error adding comment' });
    }
  });
  

router.get('/', authMiddleWare, async (req, res) => {
    try {
        const userId = req.user._id;
        const getQuote = await Quote.find();
        if(!getQuote || getQuote.length === 0) {
            return res.status(404).json({message : "Quote not found"})
        }
        const quotesWithLikes = getQuote.map((quote) => ({
            ...quote.toObject(),
            userLiked: quote.likes.includes(userId),
        }));
        res.status(200).json(quotesWithLikes);
    } catch (error) {
        console.log(error)
        res.status(500).json({message : error.message})
    }
});

router.get('/:id', async (req, res) => {
    try {
        const quoteWithComments = await Quote.findById(req.params.id)
        .populate({
            path: 'comments',
            populate: { path: 'user', select: 'username' }
        });
    if (!quoteWithComments) {
        return res.status(404).json({ message: 'Quote not found' });
    }
    res.status(200).json(quoteWithComments);
    
            // const comments = await Comment.find({quote: req.params.id})
            // .populate('user', 'username')
            // .exec();
            // res.status(200).json({quote, comments});
    } catch (error) {
        res.status(500).json({message : error.message});
    }
})

router.get('/:quoteId/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ quote: req.params.quoteId })
            .populate('user', 'username') // Adjust this to the correct field (e.g., 'username', 'email')
            .exec();
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



router.put('/:id', verifyToken, verifyOwnership, async (req, res) => {
    try {
     const updateQuote = await Quote.findByIdAndUpdate(
        req.params.id,
         req.body, 
         {new : true}
        );
        if(!updateQuote) {
            return res.status(404).json({message : "Quote not found"})
        }
     res.status(200).json(updateQuote);
    } catch (error) {
     res.status(500).json({message : error.message})
    }
 });
 
 router.delete('/quote/:id',verifyToken, verifyOwnership, async (req, res) => {
    try {
     const quote = await Quote.findByIdAndDelete(req.params.id);
     if(!quote) {
        return res.status(404).json({message : "Quote not found"})
    }
     res.status(200).json({message : 'Quote Deleted Successfully'});
    } catch (error) {
     res.status(500).json({message : error.message})
    }
 });

 module.exports = router;