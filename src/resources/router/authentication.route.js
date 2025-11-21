const express = require('express');
const authenticationController = require('../app/controller/authentication.controller');

const router = express.Router();

router.post('/login', (req, res) => authenticationController.login(req, res));
router.post('/logout', (req, res) => authenticationController.logout(req, res));
router.get('/logout', (req, res) => authenticationController.logout(req, res));
router.post('/refresh-token', (req, res) => authenticationController.refreshToken(req, res));
router.get('/verify-token', (req, res) => authenticationController.verifyToken(req, res));
router.get('/me', (req, res) => authenticationController.getMe(req, res));

module.exports = router;

