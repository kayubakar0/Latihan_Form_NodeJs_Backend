import express from "express";
import AuthController from "../controllers/AuthController.js"
import jwtAuth from "../middlewares/jwtAuth.js";

const router = express.Router()

router.post('/register', AuthController.register)
router.post('/login', AuthController.login)
router.post('/reflesh-token', jwtAuth(), AuthController.refleshToken)

export default router