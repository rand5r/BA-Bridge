import { Router, type IRouter } from "express";
import healthRouter from "./health";
import generateTbrdRouter from "./generate-tbrd";

const router: IRouter = Router();

router.use(healthRouter);
router.use(generateTbrdRouter);

export default router;
