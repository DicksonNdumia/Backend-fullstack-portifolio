import express from "express";
import {protect} from "../middleware/auth/protect.ts";
import {devDetails, getDevDetails} from "../controller/devData.controller.ts";



const router = express.Router()

router.post('/add/dev/:userId',protect,devDetails)
router.get('/details/:id',getDevDetails)

export  default router