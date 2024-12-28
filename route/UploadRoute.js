const express = require('express');
const router = express.Router(); 
const Quote = require('../schema/quoteSchema');
const uploads = require('../configure/images');
const authMiddleWare = require('../middleware/authMiddleware');
const Comment = require('../schema/CommentSchema');

router.patch('/:id/like', authMiddleWare, async (req, res) => {
    try {
    const { id } = req.params;
    const userId = req.user._id;  

        const quote = await Quote.findById(id);
        if (!quote) {
            return res.status(404).json({ message: 'Quote not found' });
        }
 
        const alreadyLiked = quote.likes.includes(userId);

        if(alreadyLiked){
            quote.likes.pull(userId);
        }else{
            quote.likes.push(userId)
        }
        
        await quote.save();

        return res.status(200).json({ 
            likes: quote.likes.length, 
            alreadyLiked: !alreadyLiked 
        });
    } catch (error) {
        console.error('Error occurred while handling like:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/:id/comments', authMiddleWare, async (req, res) => {
    try {
        const { id } = req.params; 
        const { text } = req.body; 
        const userId = req.user.userId; 

        const quote = await Quote.findById(id);

        if (!quote) {
            return res.status(404).json({ message: 'Quote not found' });
        }

        const comment = new Comment({
            text,
            user: userId,
            quote: id,
        });

        await comment.save();

        if (!quote.comments) {
            quote.comments = [];
        }

        quote.comments.push(comment._id);
        await quote.save();

        return res.status(201).json(comment);
    } catch (error) {
        console.error('Error adding comment:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});




router.post('/uploads', uploads.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const filePath = `/uploads/${req.file.filename}`;
        res.status(200).json({
            message: 'Image Uploaded Successfully',
            url: `http://localhost:8000${filePath}`,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post ( '/', async(req, res) => {
    try {
        const quote = new Quote({
          theme : req.body.theme,
          quote : req.body.quote,
          writer : req.body.writer,
          imageUrl : req.body.imageUrl,
        });
        const savedQuote = await quote.save();
        res.status(200).json(savedQuote)
    } catch (error) {
        res.status(500).json({message : error.message})
    }
});

module.exports = router;
