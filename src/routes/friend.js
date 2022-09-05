const mongoose = require('mongoose');
const router = require('express').Router();
const passport = require('passport');
const User = mongoose.model('User');
const Candidate = mongoose.model('Candidate');
const {body, query, param, validationResult} = require('express-validator');

router.get('/friend/search', passport.authenticate('jwt', {session: false}),
    query('friendName', `Field 'friendName' must not be an empty string`).notEmpty(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const {friendName} = req.query;
            const {ids} = req.query;

            const friends = await User.find({"nickname": {$regex: '.*' + friendName + '.*'}, _id: {$ne: ids}});
            res.status(200).send(friends);
        } catch (error) {
            res.status(500).send({message: error.message});
        }
    });

router.post('/candidate', passport.authenticate('jwt', {session: false}),
    body('userId', `Field 'userId' must not be an empty string`).notEmpty(),
    body('candidateId', `Field 'candidateId' must not be an empty string`).notEmpty(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const {userId, candidateId} = req.body;

            console.log(userId);
            console.log(candidateId);

            const recordExist = await Candidate.find({userId: userId, candidateId: candidateId});
            if (recordExist.length !== 0) {
                return res.status(406).json({message: `Request is exist!`})
            }

            const newCandidate = new Candidate({
                userId: userId,
                candidateId: candidateId
            });
            await newCandidate.save();
            res.status(200).send(newCandidate);
        } catch (error) {
            res.status(500).send({message: error.message});
        }
    });

router.get('/request/:id', passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            const userId = req.params.id;
            if (!userId) {
                return res.status(406).json({message: `Empty data!`})
            }
            const foundUser = await User.findById(req.params.id);
            if (!foundUser) return res.status(404).json({message: 'User not found!'});

            //my requests
            const requests = await Candidate.find({userId: userId}).populate('candidateId', '-hash -salt');

            //requests to me
            const candidates = await Candidate.find({candidateId: userId}).populate('userId', '-hash -salt');;

            // console.log(candidates);
            // console.log(requests);

            res.status(200).send({requests, candidates});
        } catch (error) {
            res.status(500).send({message: error.message});
        }
    });

router.delete('/request/:id', passport.authenticate('jwt', {session: false}),
    param('id', `Parameter 'id' must not be an empty string`).notEmpty(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }
            const id = req.params.id;
            const deletedRequest = await Candidate.findByIdAndDelete(id);
            res.status(200).send(deletedRequest);
        } catch (error) {
            res.status(500).send({message: error.message});
        }
    });

router.post('/friend', passport.authenticate('jwt', {session: false}),
    body('userId', `Field 'userId' must not be an empty string`).notEmpty(),
    body('candidateId', `Field 'candidateId' must not be an empty string`).notEmpty(),
    body('requestRecordId', `Field 'requestRecordId' must not be an empty string`).notEmpty(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const {userId, candidateId, requestRecordId} = req.body;

            await User.findByIdAndUpdate(userId, { $addToSet: { friends: candidateId } });

            await User.findByIdAndUpdate(candidateId, { $addToSet: { friends: userId } });


            const deletedRequest = await Candidate.findByIdAndDelete(requestRecordId);
            res.status(200).send(deletedRequest);
        } catch (error) {
            res.status(500).send({message: error.message});
        }
    });

router.get('/friends/:id', passport.authenticate('jwt', {session: false}),
    param('id', `Parameter 'id' must not be an empty string`).notEmpty(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const id = req.params.id;

            const friends = await User.findById(id, '-hash -salt').populate('friends', '-hash -salt -friends');
            res.status(200).send(friends);
        } catch (error) {
            res.status(500).send({message: error.message});
        }
    });

module.exports = router;
