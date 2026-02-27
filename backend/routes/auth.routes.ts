import express from "express";
import { loginUser, logoutUser, registerUser, verifyUser } from "../controllers/auth.controllers.js";
import protect from "../middlewares/auth.js";


const AuthRouter = express.Router();

AuthRouter.post('/register', registerUser)
AuthRouter.post('/login', loginUser)
AuthRouter.get('/verify', verifyUser)
AuthRouter.post('/logout', protect, logoutUser)



export default AuthRouter;
