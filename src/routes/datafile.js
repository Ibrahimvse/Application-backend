const express = require('express')
const DataFile = require('../models/datafile')
const router = new express.Router()
var path = require('path')
const fs=require('fs');

router.get('/download/:id/:title', async(req, res) => {
    res.connection.setTimeout(0);
    var id=req.params.id
    const file = await DataFile.findById(id)
    var filepath=file.filepath 
    var data=fs.readFileSync(filepath)
    res.contentType(file.filetype);
    res.send(data);
})
router.get('/:id', async (req, res) => {  
    var id=req.params.id;
    try{
        const files=await DataFile.find({owner:id});
        res.status(200).send(files);
    }catch(e){
        console.log(e)
        res.status(400).send({error:e,message})
    }
})
router.delete('/:id', async (req, res) => {  
    var id=req.params.id;
    try{
        const file=await DataFile.findByIdAndDelete(id)
        fs.rmdirSync(file.filepath,{recursive:true})
        const files=await DataFile.find({owner:file.owner});
        res.status(200).send(files);
    }catch(e){
        console.log(e)
        res.status(400).send({error:e})
    }
})

module.exports = router;