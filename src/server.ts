import dotenv from "dotenv"
import app from "./app";

dotenv.config();
const PORT = process.env.port || 4000


app.listen(PORT,()=>{
    console.log("server listen in", PORT || 5000);
})