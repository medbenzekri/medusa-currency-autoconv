import { Router } from "express";
import { wrapHandler } from "@medusajs/medusa";
import { getRates, getRateById, updateRate, deleteRate, createRate } from "./manual-rates-handler";

// Initialize a custom router
const router = Router();

export function attachAdminRoutes(adminRouter: Router) {
  adminRouter.use("/manual-rates", router);

  router.get("/:id", wrapHandler(getRateById));
  router.get("/", wrapHandler(getRates));
  router.post("/:id/delete", wrapHandler(deleteRate));
  router.post("/:id", wrapHandler(updateRate));
  router.post("/", wrapHandler(createRate));


}
