const express = require('express')
const router = new express.Router();
const path=require('path');
const Job = require('../models/jobs')

router.get('/', async(req, res) => {
    try {
        const jobs = await Job.find({})
        res.status(200).json(jobs);
    } catch (e) {
        console.log(e)
        res.status(400).send({error:e.message})
    }
})

router.post('/', async(req, res) => {
    try {
        const job = await new Job(req.body)
        await job.save()
        res.status(200).json(job);
    } catch (e) {
        console.log(e)
        res.status(400).send({error:e.message})
    }
})


router.get('/:id', async(req, res) => {
    try {
		const id=req.params.id;
        const job = await Job.findById(id)
        res.status(200).json(job);
    } catch (e) {
        console.log(e)
        res.status(400).send({error:e.message})
    }
})

router.patch('/:id', async(req, res) => {
    try {
		const id=req.params.id;
        const job = await Job.findByIdAndUpdate(id,req.body)
        res.status(200).json(job);
    } catch (e) {
        console.log(e)
        res.status(400).send({error:e.message})
    } 
})



router.delete('/:id', async(req, res) => {
    try {
        var id=req.params.id;
        var job=await Job.findOneAndDelete({_id:id})
        var jobs=await Job.find({})
        res.status(200).json(jobs);
    }catch(e){
        console.log(e)
        res.status(400).send({error:e.message})
    }
});
module.exports = router;