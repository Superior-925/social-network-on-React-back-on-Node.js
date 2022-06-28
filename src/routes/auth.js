const mongoose = require('mongoose');
const router = require('express').Router();
const passport = require('passport');
const {body, param, header, validationResult} = require('express-validator');
const User = mongoose.model('User');
const RefreshToken = mongoose.model('RefreshToken');
const jwt = require('jsonwebtoken');

const utils = require('../lib/utils');

const issueTokensPair = async (userId) => {
    try {
        const newRefreshToken = new RefreshToken({
            user: userId,
            token: utils.issueRefreshToken(),
        });

        const refreshToken = await newRefreshToken.save();
        const tokenObject = utils.issueJWT(userId);

        return {
            token: tokenObject.token,
            expiresIn: tokenObject.expiresIn,
            refresh: refreshToken,
        };
    } catch (e) {
        console.log(e);
    }
};

router.post('/refresh', body('refreshToken', `Field 'refreshToken' must not be an empty string`).notEmpty(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const refreshToken = req.body.refreshToken;
            const refreshTokenData = await RefreshToken.findOne({token: refreshToken});
            if (!refreshTokenData) {
                return res.status(404).json({
                    message: 'Refresh token not found',
                });
            }

            if (!utils.verifyToken(refreshTokenData.token)) {
                return res.status(401).json({message: 'Invalid refresh token or token expired!'});
            }

            await RefreshToken.deleteOne({token: refreshToken});

            const tokenPair = await issueTokensPair(refreshTokenData.user);

            res.status(200).json({
                success: true,
                ...tokenPair,
            });
        } catch (error) {
            res.status(500).send({message: error.message});
        }
    });

// Validate an existing user and issue a JWT
router.post('/login',
    body('data.email', `Field 'email' must not be an empty string`).notEmpty(),
    body('data.password', `Field 'password' must not be an empty string`).notEmpty(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const user = await User.findOne({email: req.body.data.email});
            if (!user) {
                return res.status(401).json({success: false, message: 'User not found!'});
            }

            const isValid = utils.validPassword(req.body.data.password, user.hash, user.salt);

            if (isValid) {
                const tokenPair = await issueTokensPair(user._id);

                res.status(200).json({
                    userId: user._id,
                    userNickname: user.nickname,
                    success: true,
                    ...tokenPair,
                });
            } else {
                res.status(401).json({success: false, message: 'You entered the wrong password'});
            }
        } catch (error) {
            res.status(500).send({message: error.message});
        }
    });

// Register a new user
router.post('/signup',
    body('data.email', `Field 'email' must not be an empty string`).notEmpty(),
    body('data.password', `Field 'password' must not be an empty string`).notEmpty(),
    body('data.nickname', `Field 'nickname' must not be an empty string`).notEmpty(),
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const userCandidate = await User.findOne({email: req.body.data.email});
            if (userCandidate) {
                return res.status(409).json({success: false, message: 'This email already exists!'});
            }

            const saltHash = utils.genPassword(req.body.data.password);

            const salt = saltHash.salt;
            const hash = saltHash.hash;

            const newUser = new User({
                email: req.body.data.email,
                nickname: req.body.data.nickname,
                hash: hash,
                salt: salt,
            });

            const user = await newUser.save();
            const tokenPair = await issueTokensPair(user._id);

            res.status(200).json({
                userId: user._id,
                userNickname: user.nickname,
                success: true,
                ...tokenPair,
            });
        } catch (error) {
            res.status(500).send({message: error.message});
        }
    });

// user logs out using his access (expired?) token
// refresh token might be expired as well
// both tokens might be stolen
router.post('/logout', header('Authorization', `Header 'Authorization' must not be an empty string`).notEmpty(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const authHeader = req.get('Authorization');
            const token = authHeader.replace('Bearer ', '');
            const data = utils.verifyToken(token, true); //ignore expiration here
            await RefreshToken.deleteMany({user: data.sub});

            res.status(200).json({
                success: true,
            });
        } catch (error) {
            res.status(500).send({message: error.message});
        }
    });

module.exports = router;
