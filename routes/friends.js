const mongoose = require('mongoose');
const router = require('express').Router();
const passport = require('passport');
const User = mongoose.model('User');

router.get('/friends/', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { friendName } = req.query;
            const { ids } = req.query;
            const friends = await User.find({ "nickname": { $regex: '.*' + friendName + '.*' } , _id: { $ne: ids }}).catch((err) => console.log(err));
            res.status(200).send(friends);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });

module.exports = router;
