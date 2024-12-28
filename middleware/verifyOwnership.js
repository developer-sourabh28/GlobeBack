const Quote = require('../schema/quoteSchema'); // Use QuoteSchema to check ownership

const verifyOwnership = async (req, res, next) => {
  try {
    const quote = await Quote.findById(req.params.id); // Find the quote by ID
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    // Check if the logged-in user is the owner of the quote
    if (quote.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    next(); // Proceed to the next middleware if ownership is verified
  } catch (error) {
    console.error('Ownership verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = verifyOwnership;
