const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    console.log('Session before destroy:', req.session);
    req.session.destroy((err) => {
        if (err) {
            console.log('Error destroying session:', err);
            return res.status(500).json({ message: 'Logout Failed' });
        }
        console.log('Session destroyed');
        res.clearCookie('connect.sid', { path: '/' });
        res.status(200).json({ message: 'Logout Successful' });
    });
});


module.exports = router;