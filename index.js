const { MongoClient } = require('mongodb')
const cors = require('cors')
const express = require('express')
const app = express()
const port = process.env.PORT || 4500

const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(cors())

const url = 'mongodb+srv://user_harsha:9440554076@cluster0.brbe4.mongodb.net/<sample_airbnb>?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true'

const client = new MongoClient(url);

const dbName = 'Quiz'



app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());


app.get('/api/getQuestions', (req,res) => {
    const collectionName = 'questions'

    listDatabases = async () => {
        databaseList = await client.db().admin().listDatabases()
    
        console.log('Databases => ')
        databaseList.databases.forEach(db => console.log(` ${db.name}`))
    }
    
    const shuffleArray = array => { 
        for (var i = array.length - 1; i > 0; i--) {  
         
            // Generate random number  
            var j = Math.floor(Math.random() * (i + 1)); 
                         
            var temp = array[i]; 
            array[i] = array[j]; 
            array[j] = temp; 
        } 
             
        return array.slice(0,5); 
     } 
    
    const getRandom = (result) => {
        let questions = []
        let randomQuestions = shuffleArray(result)

        randomQuestions.forEach(item => {
            questions.push({
                question: item.questionString, 
                options: item.options,
                questionId: item.questionId,
                marks: item.marks,
                correctAnswer: item.correctAnswer
            })
        })
        return questions
    }
    
    async function run() {
        try {
            await client.connect();
            console.log("Connected to server mate!")
            // const db = client.db(dbName)
    
            // const collection = db.collection('listingsAndReviews')
    
            // console.log(collection)
    
            // await  listDatabases(client);
    
            result = await client.db(dbName).collection(collectionName).find({}).toArray()
            // console.log(result)
            // result.map(question => console.log(question.questionString))
            let questions = getRandom(result)
            res.json(getRandom(result))
        } catch(err) {
            console.log(err.stack)
        }
    
        // finally{
        //     await client.close()
        // }
    }
    run().catch(console.dir)
})

app.post('/api/saveFormData', jsonParser, async (req, res) => {
    await client.connect();
    const collectionName = 'userInfo'

    const col = client.db(dbName).collection(collectionName);

    console.log(req.body)
    let userDocument = {
        "name": req.body.username.toLowerCase(),
        "score" : req.body.score,                                                                                                                                
        "userAnswers": req.body.userAnswers ,                                                                                                                                 
        "data": [...req.body.data],
    }

    // Insert a single document, wait for promise so we can read it back
    const p = await col.insertOne(userDocument);
})

app.get('/api/getUserData', async (req,res) => {
    const userName = req.query.username

    await client.connect();
    const collectionName = 'userInfo'
    
    result = await client.db(dbName).collection(collectionName).find({name: userName}).toArray()   
    
    res.json(result)
})

// app.get('api/usernameValidation', async (req,res) => {
//     const username = req.query.username

//     await client.connect();
//     const collectionName = 'userInfo'
    
//     result = await client.db(dbName).collection(collectionName).find({name: userName}).toArray()
//     if(resul)

// })


app.listen(port, () => {
    console.log("Connection established, app listening to ",port)
})

