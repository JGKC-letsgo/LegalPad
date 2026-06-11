import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mattersRouter from "./matters";
import issuesRouter from "./issues";
import analysisRouter from "./analysis";
import recommendationsRouter from "./recommendations";
import caveatsRouter from "./caveats";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(mattersRouter);
router.use(issuesRouter);
router.use(analysisRouter);
router.use(recommendationsRouter);
router.use(caveatsRouter);
router.use(dashboardRouter);

export default router;
