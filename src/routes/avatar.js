const mongoose = require('mongoose');
const router = require('express').Router();
const passport = require('passport');
const {body, param, validationResult} = require('express-validator');
const Avatar = mongoose.model('Avatar');
const User = mongoose.model('User');
const fs = require('fs');

router.post('/avatar', passport.authenticate('jwt', {session: false}),
    body('userId', `Field 'userId' must not be an empty string`).notEmpty(),
    body('file', `Field 'file' must not be an empty string`).notEmpty(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const avatar = await Avatar.findOne({userId: req.body.userId});
            if (avatar != null) {
                const base64String = req.body.file;
                const base64Image = base64String.split(';base64,').pop();
                await fs.writeFile(`src/assets/avatars/${avatar.imageName}`, base64Image, {encoding: 'base64'}, async function (err) {
                    if (!err) {
                        await fs.readFile(`src/assets/avatars/${avatar.imageName}`, {encoding: 'base64'}, function (err, data) {
                            if (!err) {
                                res.status(200).send(data);
                            } else {
                                res.status(500).send({message: err.message});
                            }
                        });
                    }
                });
            }
            if (avatar == null) {
                const base64String = req.body.file;
                const base64Image = base64String.split(';base64,').pop();
                await fs.writeFile(`src/assets/avatars/${req.body.userId}.png`, base64Image, {encoding: 'base64'}, async function (err) {
                    if (!err) {
                        const newAvatar = new Avatar({
                            imageName: `${req.body.userId}.png`,
                            userId: `${req.body.userId}`
                        });

                        const user = await User.findById(req.body.userId);
                        user.avatar = true;
                        await user.save();

                        await newAvatar.save();
                        await fs.readFile(`src/assets/avatars/${newAvatar.imageName}`, {encoding: 'base64'}, function (err, data) {
                            if (!err) {
                                res.status(200).send(data);
                            } else {
                                res.status(500).send({message: err.message});
                            }
                        });
                    }
                });
            }
        } catch (error) {
            res.status(500).send({message: error.message});
        }
    });

router.get('/avatar/:id', passport.authenticate('jwt', {session: false}),
    param('id', `Parameter 'id' must not be an empty string`).notEmpty(),
    async (req, res) => {
        try {
            console.log("Id for avatar" + req.params.id);

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const avatar = await Avatar.findOne({userId: req.params.id});
            if (avatar !== null) {
                await fs.readFile(`src/assets/avatars/${avatar.imageName}`, {encoding: 'base64'}, function (err, data) {
                    if (!err) {
                        res.status(200).send(data);
                    } else {
                        res.status(500).send({message: err.message});
                    }
                });
            }
            if (avatar === null) {
                res.status(204).send({message: "Image not found"});
            }
        } catch (error) {
            res.status(500).send({message: error.message});
        }
    });

module.exports = router;
