const mongoose = require('mongoose');
const router = require('express').Router();
const passport = require('passport');
const Post = mongoose.model('Post');
const User = mongoose.model('User');
const {body, param, validationResult} = require('express-validator');

router.post('/post', passport.authenticate('jwt', {session: false}),
    body('userId', `Field 'userId' must not be an empty string`).notEmpty(),
    body('post', `Field 'post' must not be an empty string`).notEmpty(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const foundUser = await User.findById(req.body.userId);
            if (!foundUser) return res.status(404).json({message: 'User not found!'});
            const newPost = new Post({
                postText: req.body.post,
                userId: foundUser._id
            });
            await newPost.save();
            const post = await Post.findById(newPost._id).populate('userId');
            res.status(200).send(post);
        } catch (error) {
            res.status(500).send({message: error.message});
        }
    });

router.get('/post/:id', passport.authenticate('jwt', {session: false}),
    param('id', `Parameter 'id' must not be an empty string`).notEmpty(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const userId = req.params.id;
            const foundUser = await User.findById(req.params.id);
            if (!foundUser) return res.status(404).json({message: 'User not found!'});
            const posts = await Post.find({userId: userId}).populate('userId');
            res.status(200).send(posts);
        } catch (error) {
            res.status(500).send({message: error.message});
        }
    });

router.delete('/post/:id', passport.authenticate('jwt', {session: false}),
    param('id', `Parameter 'id' must not be an empty string`).notEmpty(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const foundPost = await Post.findById(req.params.id);
            if (!foundPost) return res.status(404).json({message: 'Post not found!'});
            const deletedPost = await Post.findByIdAndDelete(req.params.id);
            res.status(200).send(deletedPost);
        } catch (error) {
            res.status(500).send({message: error.message});
        }
    });

router.patch('/post', passport.authenticate('jwt', {session: false}),
    body('postId', `Field 'postId' must not be an empty string`).notEmpty(),
    body('postText', `Field 'postText' must not be an empty string`).notEmpty(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const foundPost = await Post.findById(req.body.postId);
            if (!foundPost) return res.status(404).json({message: 'Post not found!'});
            foundPost.postText = req.body.postText;
            foundPost.save(function (err, result) {
                if (!err) {
                    res.status(200).send(result);
                }
            });

        } catch (error) {
            res.status(500).send({message: error.message});
        }
    });

module.exports = router;
