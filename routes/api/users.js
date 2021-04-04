const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../../models/User');

// @route POST api/users
// @desc Register user
// @access Public
router.post('/',[
    check('email','Email is required').isEmail(),
    check('password', 'Enter a valid password').isLength({min: 6})
], async (req,
                res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    const { email, password } = req.body;

    try{
    // See if user exists
        let user = await User.findOne({ email: email});

        if(user){
            return res.status(400).json({errors: [{msg: 'User already exist'}] });
        }

        user = new User({
            email: email,
            password: password
        });

    // Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

    // Return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(payload, config.get('jwtSecret'),
            {expiresIn: 360000 },
            (err,token) => {
            if(err) throw err;
            res.json({ token });
            });
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }



});


module.exports = router;