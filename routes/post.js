const mongoose = require('mongoose');
const router = require('express').Router();
const passport = require('passport');
const Post = mongoose.model('Post');
const User = mongoose.model('User');

router.post('/post', passport.authenticate('jwt', { session: false }),
   async (req, res) => {
        try {
            const foundUser = await User.findById(req.body.userId).catch((err) => console.log(err));
            if (!foundUser) return res.status(404).json({ message: 'User not found!' });
            const newPost = new Post({
                postText: req.body.post,
                userId: foundUser._id
            });

            const post = await newPost.save().catch((err) => console.log(err));
            res.status(200).send(post);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });

router.get('/post/:id', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const userId = req.params.id;
            const foundUser = await User.findById(req.params.id).catch((err) => console.log(err));
            if (!foundUser) return res.status(404).json({ message: 'User not found!' });
            const posts = await Post.find({ userId : userId});
            res.status(200).send(posts);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });

router.delete('/post/:id', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const foundPost = await Post.findById(req.params.id).catch((err) => console.log(err));
            if (!foundPost) return res.status(404).json({ message: 'Post not found!' });
            const deletedPost = await Post.findByIdAndDelete(req.params.id);
            res.status(200).send(deletedPost);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });

router.patch('/post', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {

            const foundPost = await Post.findById(req.body.postId);

            if (!foundPost) return res.status(404).json({ message: 'Post not found!' });

            foundPost.postText = req.body.postText;

            foundPost.save(function (err, result) {
                if (!err) {
                    res.status(200).send(result);
                }
            });

        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });

module.exports = router;
