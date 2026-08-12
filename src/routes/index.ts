import { Router } from "express";
import { loginUser, registerUser } from "../controller/controller";

import products from "../services/products";
import category from "../services/category";
import review from "../services/review";
import order from "../services/order";



const router = Router();



router.post("/register", registerUser);

router.post("/login", loginUser);






router.use("/categories", category);
router.use("/products", products);
router.use("/reviews", review);
router.use("/orders", order);


export default router;