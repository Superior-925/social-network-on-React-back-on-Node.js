const mongoose = require('mongoose');
const router = require('express').Router();
const passport = require('passport');
// const Post = mongoose.model('Post');
// const User = mongoose.model('User');
const Avatar = mongoose.model('Avatar');
const fs = require('fs');

router.post('/avatar',
    async (req, res) => {
        try {
            const avatar = await Avatar.findOne({userId: req.body.userId});
            if (avatar != null) {
                const base64String = req.body.file;
                const base64Image = base64String.split(';base64,').pop();
                await fs.writeFile(`./assets/avatars/${avatar.imageName}`, base64Image, {encoding: 'base64'}, async function(err) {
                    if (!err) {
                        await fs.readFile(`./assets/avatars/${avatar.imageName}`, {encoding: 'base64'}, function(err,data){
                            if (!err) {
                                res.status(200).send(data);
                            } else {
                                console.log(err);
                            }
                        });
                    }
                });
            }
            if (avatar == null) {
                const base64String = req.body.file;
                const base64Image = base64String.split(';base64,').pop();
                await fs.writeFile(`./assets/avatars/${req.body.userId}.png`, base64Image, {encoding: 'base64'}, async function(err) {
                    if (!err) {
                        const newAvatar = new Avatar({
                            imageName: `${req.body.userId}.png`,
                            userId: `${req.body.userId}`
                        });
                        await newAvatar.save();
                        await fs.readFile(`./assets/avatars/${newAvatar.imageName}`, {encoding: 'base64'}, function(err,data){
                            if (!err) {
                                res.status(200).send(data);
                            } else {
                                console.log(err);
                            }
                        });
                    }
                });
            }
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });

router.get('/avatar/:id',
    async (req, res) => {
        try {
            const avatar = await Avatar.findOne({userId: req.params.id});
            if (avatar != null) {
                await fs.readFile(`./assets/avatars/${avatar.imageName}`, {encoding: 'base64'}, function(err,data){
                    if (!err) {
                        res.status(200).send(data);
                    } else {
                        console.log(err);
                    }
                });
            }
            // if (avatar == null) {
            //     res.status(404).json({ message: 'Avatar not found!' });
            // }
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });

module.exports = router;
