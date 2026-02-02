import express, { Request, Response } from 'express';
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/db.js';
import session from 'express-session'
import MongoStroe from 'connect-mongo'
import AuthRouter from './routes/auth.routes.js';
import ThumbnailRouter from './routes/thumbnail.routes.js';
import UserRouter from './routes/userroutes.js';
import morgan from 'morgan';

declare module 'express-session'{
    interface SessionData{
        isLoggedIn:boolean;
        userId:string
    }
}

await connectDB()
const app = express();

const port = process.env.PORT || 3000;

app.use(cors({
    origin : ['http://localhost:5173' , 'http://localhost:3000'],
    credentials:true
}))

app.use(session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie : {maxAge: 1000* 60 * 60 *24 *7}, // 7 days
    store: MongoStroe.create({
        mongoUrl: process.env.MONGO_URI as string,
        collectionName: 'sessions'
    })
}))


app.use(express.json())
app.use(morgan('dev'))

app.use('/api/auth',AuthRouter)
app.use('/api/thumbnail',ThumbnailRouter)
app.use('/api/user',UserRouter)

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

