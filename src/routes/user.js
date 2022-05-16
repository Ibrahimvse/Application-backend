const express = require('express')
const router = new express.Router();
const User = require('../models/user')
const path=require('path');


router.post('/login', async(req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).json({token })
    } catch (e) {
        res.status(400).send({error:e.message})
    }
});

router.post('/register',async (req,res)=>{
    try{
        var user = await User.findOne({email:req.body.email})
        if (user) {
            throw new Error('أسم ألمستخدم موجود مسبقا في ألنظام')
        }
        user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(200).json(user)

    }catch(e){
        res.status(400).send({error:e.message})
    }
})
module.exports = router;