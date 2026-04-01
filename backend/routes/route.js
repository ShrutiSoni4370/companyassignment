import express from "express";
import {
  registerController,
  loginController,
  logoutController,
  createCharityController,
  getAllCharitiesController,
  getCharityByIdController,
  updateCharityController,
  deleteCharityController,
  createSubscriptionPlanController,
  getAllSubscriptionPlansController,
  getSubscriptionPlanByIdController,
  updateSubscriptionPlanController,
  deleteSubscriptionPlanController,
  getAllUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
  addScoreController,
  deleteScoreController,
  selectCharityController,
  selectSubscriptionController,
  runDrawController
} from "./../controllers/controller.js";

import { isAuthenticated } from "./../Middlewares/middle.js";

const router = express.Router();

// auth
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/logout", logoutController);

// charities
router.post("/charities", createCharityController);
router.get("/charities", getAllCharitiesController);
router.get("/charities/:id", getCharityByIdController);
router.put("/charities/:id", updateCharityController);
router.delete("/charities/:id", deleteCharityController);

// subscriptions
router.post("/subscriptions", createSubscriptionPlanController);
router.get("/subscriptions", getAllSubscriptionPlansController);
router.get("/subscriptions/:id", getSubscriptionPlanByIdController);
router.put("/subscriptions/:id", updateSubscriptionPlanController);
router.delete("/subscriptions/:id", deleteSubscriptionPlanController);

// users
router.get("/users", getAllUsersController);
router.get("/users/:id", getUserByIdController);
router.put("/users/:id", updateUserController);
router.delete("/users/:id", deleteUserController);

//scores

router.post("/scores", isAuthenticated, addScoreController);
router.delete("/scores/:scoreId", isAuthenticated, deleteScoreController);
router.post("/select-charity", isAuthenticated, selectCharityController);
router.post("/select-subscription", isAuthenticated, selectSubscriptionController);

//run the draw
router.post("/run", runDrawController);

export default router;