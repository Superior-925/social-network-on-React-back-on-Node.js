const mongoose = require('mongoose');
const router = require('express').Router();
const passport = require('passport');
const User = mongoose.model('User');
const Candidate = mongoose.model('Candidate');

router.get('/friend/search', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { friendName } = req.query;
            const { ids } = req.query;
            if (friendName.trim().length < 1) {
                return res.status(406).json({ message: `Name of friend can't by empty!`});
            }
            const friends = await User.find({ "nickname": { $regex: '.*' + friendName + '.*' } , _id: { $ne: ids }});
            res.status(200).send(friends);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });

router.post('/candidate', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const {userId, candidateId} = req.body;
            if (!userId || !candidateId) {
                return res.status(406).json({ message: `Empty data!`})
            }
            const newCandidate = new Candidate({
                userId: userId,
                candidateId: candidateId
            });
            await newCandidate.save();
            res.status(200).send(newCandidate);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });

router.get('/request/:id', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const userId = req.params.id;
            if (!userId) {
                return res.status(406).json({ message: `Empty data!`})
            }
            const foundUser = await User.findById(req.params.id);
            if (!foundUser) return res.status(404).json({ message: 'User not found!' });
            const candidates = await Candidate.find({ userId : userId});
            const iCandidate = await Candidate.find({ candidateId : userId}).populate("userId");
            res.status(200).send({candidates: candidates, iCandidate: iCandidate});
            //res.status(200).send(candidates);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });

router.delete('/request/', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { userId } = req.query;
            const { candidateId } = req.query;
            console.log(userId);
            console.log(candidateId);
            if (!userId || !candidateId) {
                return res.status(406).json({ message: `Empty data!`})
            }
            // const foundUser = await User.findById(req.params.id);
            // if (!foundUser) return res.status(404).json({ message: 'User not found!' });
            const deletedCandidate = await Candidate.findOneAndDelete({userId: userId, candidateId: candidateId});
            res.status(200).send(deletedCandidate);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });

module.exports = router;
