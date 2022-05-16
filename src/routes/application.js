const express = require('express')
const router = new express.Router();
const ApplicationForm = require('../models/application')
const DataFile = require('../models/datafile')
const path=require('path');
const fs=require('fs');


var renameDirectory=async function(source,dest){
    source=path.dirname(path.dirname(__dirname))+'/'+source;
    dest=path.dirname(path.dirname(__dirname))+'/'+dest; 
    if (fs.existsSync(source)){
        try{
            fs.renameSync(source,dest,{recursive:true})
        }catch(e){
            console.log(e)
        }     
    }
}

var updateFiles=async function(id,dir){
    try{
        const files=await DataFile.find({owner:id})
        for(var file of files){
            file.filepath=dir+"/"+file.filename;
            await file.save();
        }
    }catch(e){
        console.log(e)
    }
}

var calculateGPAScore=function(gpa){
    var score=0;
    if(gpa>=90 && gpa<=100) score=25;
    else  if(gpa>=80 && gpa<90) score=20;
    else  if(gpa>=70 && gpa<80) score=15;
    else  if(gpa>=60 && gpa<70) score=10;
    else  if(gpa>=50 && gpa<60) score=5;
    return score;
}

var calculateGraduationYearScore=function(date){
    var now=new Date();
    var graduationDate=new Date(date);
    var years=now.getFullYear()-graduationDate.getFullYear();
    if(years>5)  years=5;
    return years;
}

var calculateMaritialScore=function(applicationForm){
    var score=0;
    if(applicationForm.MaritialStatus!="أعزب"){
        if(applicationForm.NumberOfChilderen==0){
            score=5;
        }else{
            score=10;
        }
        if(applicationForm.MaritialStatus=="متزوج"){
            if(applicationForm.IsPartenerEmployeed=="نعم"){
                score=0
            }
        }

    }
    return score;
}
var calculateContractScore=function(applicationForm){
    var score=0;
    if(applicationForm.permanentContract.isAvailable=="نعم"){
        var startDate=new Date(applicationForm.permanentContract.startDate);
        var endDate=new Date(applicationForm.permanentContract.endDate);
        var years=Math.abs(startDate.getFullYear()- endDate.getFullYear());
        score=score+years*2;
    }
    if(applicationForm.dailyContract.isAvailable=="نعم"){
        var startDate=new Date(applicationForm.dailyContract.startDate);
        var endDate=new Date(applicationForm.dailyContract.endDate);
        var years=Math.abs(startDate.getFullYear()- endDate.getFullYear());
        score=score+years*1;
    }
    if(score>25) score=25;
    return score;
}

var calculateScore=async function(applicationForm){
    try{
        applicationForm.applicationScore.graduationYearScore=calculateGraduationYearScore(applicationForm.degreeDate);
        applicationForm.applicationScore.graduationGPAScore=calculateGPAScore(applicationForm.degreeGPA)
        applicationForm.applicationScore.maritialScore=calculateMaritialScore(applicationForm)
        applicationForm.applicationScore.contractScore=calculateContractScore(applicationForm)

        applicationForm.finalScore=applicationForm.applicationScore.graduationYearScore+
                                    applicationForm.applicationScore.graduationGPAScore+
                                    applicationForm.applicationScore.maritialScore+
                                    applicationForm.applicationScore.contractScore+
                                    applicationForm.interviewScore;
        
    }catch(e){
        console.log(e)
    }
}


var saveFiles=async function(req,application_id,dir){
    for(var file in req.files){
        var datafile=new DataFile()
        datafile.owner=application_id
        datafile.size=Math.round(Number(req.files[file].size / 1024))
        datafile.filetype=req.files[file].mimetype
        datafile.filename=req.files[file].name
        datafile.filepath=dir+'/'+datafile.filename
        fs.writeFileSync(datafile.filepath,req.files[file].data)
        await datafile.save()
    }
}
var parseFields=function(req,fields){
    for(var field of fields){
        req.body[field]=JSON.parse(req.body[field])
    }
}

var createDirectory=async function(directorypath){
    if(!fs.existsSync(directorypath)){
        fs.mkdirSync(directorypath,{recursive:true});
    }
    return directorypath;
}

router.post('/', async (req, res) => {
    res.connection.setTimeout(0);
    parseFields(req,['dailyContract','permanentContract',"isMinority","job"])
    
    try{
        var applicationForm=new ApplicationForm(req.body);
        applicationForm.uploader=req.headers.authorization;
        var filesPath="Users files/"+applicationForm.Name;
        applicationForm.FilePath=filesPath;
        calculateScore(applicationForm);
        await createDirectory(filesPath)
        await saveFiles(req,applicationForm._id,filesPath) 

        await applicationForm.save();
        res.status(200).send(applicationForm)

    }catch(e){
        console.log(e)
        res.status(400).send({error:e})
    }
})

router.patch('/interview/:id', async (req, res) => {
    res.connection.setTimeout(0);
    var id=req.params.id;
    try{
        var applicationForm=await ApplicationForm.findByIdAndUpdate(id,req.body,{ new:true, runValidators: true })
        calculateScore(applicationForm);
        await applicationForm.save();
        res.status(200).send(applicationForm)
    }catch(e){
        console.log(e)
        res.status(400).send({error:e}) 
    }

})

router.patch('/:id', async (req, res) => {
    res.connection.setTimeout(0);
    var id=req.params.id;
    parseFields(req,['dailyContract','permanentContract',"isMinority","job"])
    try{
        var oldForm=await ApplicationForm.findById(id)
        var applicationForm=await ApplicationForm.findByIdAndUpdate(id,req.body,{ new:true, runValidators: true })
        applicationForm.uploader=req.headers.authorization;
        var filesPath="Users files/"+applicationForm.Name;
        if(oldForm.Name!==applicationForm.Name){
            applicationForm.FilePath=filesPath;
            await renameDirectory(oldForm.FilePath,filesPath)
            await updateFiles(oldForm._id,filesPath)
        }
        calculateScore(applicationForm);
        await saveFiles(req,applicationForm._id,filesPath) 
        await applicationForm.save();
        res.status(200).send(applicationForm)

    }catch(e){
        console.log(e)
        res.status(400).send({error:e})
    }
})

router.get('/', async(req, res) => {
    try {
        const applicationForms = await ApplicationForm.find({})
        res.status(200).json(applicationForms);
    } catch (e) {
        console.log(e)
        res.status(400).send({error:e.message})
    }
})

router.get('/:id', async(req, res) => {
    try {
		const id=req.params.id;
        const applicationForm = await ApplicationForm.findById(id)
        const Files=await DataFile.find({owner:id});
        res.status(200).json({applicationForm,Files});
    } catch (e) {
        console.log(e)
        res.status(400).send({error:e.message})
    }
})
router.get('/email/:email', async(req, res) => {
    try {
		const email=req.params.email;
        const applicationForm = await ApplicationForm.findOne({email:email})
        res.status(200).json(applicationForm);
    } catch (e) {
        console.log(e)
        res.status(400).send({error:e.message})
    }
})

router.delete('/:id', async(req, res) => {
    try {
        var id=req.params.id;
        var applicationForm=await ApplicationForm.findOneAndDelete({_id:id})
        res.status(200).json(applicationForm);
    }catch(e){
        console.log(e)
        res.status(400).send({error:e.message})
    }
});

router.post('/filter',async(req, res) => {
    try{
        var filters=req.body;
        var queryResult=[];

        for(var item of filters){
            if(item.key=="job"){
                var filter={
                    "job.title":{
                        $in:item.values
                    }
                }
                queryResult.push(filter)
            }
            if(item.key=="acceptance"){
                var filter={
                    "acceptance":{
                        $in:item.values
                    }
                }
                queryResult.push(filter)
            }
            if(item.key=="degree"){
                var filter={
                    degree:{$in:item.values}
                }
                queryResult.push(filter)
            }
            if(item.key=="isOfThreeCollegeRanks"){
                var filter={
                    isOfThreeCollegeRanks:{$in:item.values}
                }
                queryResult.push(filter)
            }
            if(item.key=="isOfSpecialCareNeeds"){
                var filter={
                    isOfSpecialCareNeeds:{$in:item.values}
                }
                queryResult.push(filter)
            }
        }
        var applicationForms = await ApplicationForm.find({})
        if(queryResult.length==0){
            res.status(200).json(applicationForms);
        }else{
            var query=ApplicationForm.find().and(queryResult);           
            query.exec(function (err, result) {
                res.status(200).json(result);
            })
        }
    }catch(e){
        res.status(400).send({error:e.message})
    }

})

module.exports = router;