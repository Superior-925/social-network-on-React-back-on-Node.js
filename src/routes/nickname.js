const mongoose = require('mongoose');
const router = require('express').Router();
const passport = require('passport');
const {body, param, validationResult} = require('express-validator');
const Avatar = mongoose.model('Avatar');
const User = mongoose.model('User');
const fs = require('fs');

router.post('/nickname', passport.authenticate('jwt', {session: false}),
    body('userId', `Field 'userId' must not be an empty string`).notEmpty(),
    body('nickname', `Field 'nickname' must not be an empty string`).notEmpty(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const foundUser = await User.findById(req.body.userId);
            if (!foundUser) return res.status(404).json({message: 'User not found!'});
            const foundNickname = await User.find({nickname: req.body.nickname});
            if (foundNickname.length) {
                return res.status(406).json({message: `Nickname already exist!`});
            }
            foundUser.nickname = req.body.nickname;
            await foundUser.save();
            res.status(200).send(foundUser.nickname);
        } catch (error) {
            res.status(500).send({message: error.message});
        }
    });

router.get('/nickname/:id', passport.authenticate('jwt', {session: false}),
    param('id', `Parameter 'id' must not be an empty string`).notEmpty(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const foundUser = await User.findById(req.params.id);
            if (!foundUser) return res.status(404).json({message: 'User not found!'});
            res.status(200).send(foundUser);
        } catch (error) {
            res.status(500).send({message: error.message});
        }
    });

module.exports = router;