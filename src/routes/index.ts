import { Router } from "express";
import { loginUser, registerUser } from "../controller/controller";

import products from "../services/products";
import category from "../services/category";



const router = Router();



router.post("/register", registerUser);

router.post("/login", loginUser);






router.use("/categories", category);
router.use("/products", products);


export default router;