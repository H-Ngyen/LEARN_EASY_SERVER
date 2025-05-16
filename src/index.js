import express from 'express'
import 'dotenv/config'
import mongoose from 'mongoose'
import cors from 'cors'
import RoadMapRoute from './routes/RoadMapRoutes.js'
import MyRoadmapRoute from './routes/MyRoadmapRoute.js'

mongoose.connect(process.env.MONGODB_CONNECTION_STRING).then(() => { console.log("MongoDB connected") }).catch((e) => { console.log("MongoDB error: " + e) })

const app = express();
const port = 3000;

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/roadmap", RoadMapRoute);
app.use("/api/my/roadmap", MyRoadmapRoute);

app.listen(port, () => console.log(`Example app listening on port localhost:${port}`))