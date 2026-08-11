import { Router } from "express";
import { loginUser, registerUser } from "../controller/controller";

import products from "../services/products";
import category from "../services/category";
import review from "../services/review";



const router = Router();



router.post("/register", registerUser);

router.post("/login", loginUser);






router.use("/categories", category);
router.use("/products", products);
router.use("/reviews", review);


export default router;