import {
  registerUser,
  loginUser,
  logout,
  createCharity,
  getAllCharities,
  getCharityById,
  updateCharity,
  deleteCharity,
  createSubscriptionPlan,
  getAllSubscriptionPlans,
  getSubscriptionPlanById,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  addScoreService,
  selectCharityService,
  runDrawService,
  deleteScoreService,
  selectSubscriptionService

} from "../services/service.js";


export const registerController = async (req, res) => {
  try {
    const userData = await registerUser(req.body);
    console.log("Registration successful, status:", 200);
    res.status(201).json(userData);
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(400).json({ message: error.message });
  }
};

export const loginController = async (req, res) => {
  try {
    const userData = await loginUser(req.body);
    console.log("Login successful, status:", 200);
    res.status(200).json(userData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const logoutController = async (req, res) => {
  try {
    await logout(req, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//charityController


export const createCharityController = async (req, res) => {
  try {
    const charity = await createCharity(req.body);

    res.status(201).json({
      success: true,
      message: "Charity created successfully",
      data: charity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create charity",
    });
  }
};

export const getAllCharitiesController = async (req, res) => {
  try {
    const charities = await getAllCharities();

    res.status(200).json({
      success: true,
      data: charities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch charities",
    });
  }
};

export const getCharityByIdController = async (req, res) => {
  try {
    const charity = await getCharityById(req.params.id);

    res.status(200).json({
      success: true,
      data: charity,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || "Charity not found",
    });
  }
};

export const updateCharityController = async (req, res) => {
  try {
    const charity = await updateCharity(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Charity updated successfully",
      data: charity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update charity",
    });
  }
};

export const deleteCharityController = async (req, res) => {
  try {
    const charity = await deleteCharity(req.params.id);

    res.status(200).json({
      success: true,
      message: "Charity deleted successfully",
      data: charity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete charity",
    });
  }
};

// subscriptionPlanController

export const createSubscriptionPlanController = async (req, res) => {
  try {
    const plan = await createSubscriptionPlan(req.body);

    res.status(201).json({
      success: true,
      message: "Subscription plan created successfully",
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create subscription plan",
    });
  }
};

export const getAllSubscriptionPlansController = async (req, res) => {
  try {
    const plans = await getAllSubscriptionPlans();

    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch subscription plans",
    });
  }
};

export const getSubscriptionPlanByIdController = async (req, res) => {
  try {
    const plan = await getSubscriptionPlanById(req.params.id);

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || "Subscription plan not found",
    });
  }
};

export const updateSubscriptionPlanController = async (req, res) => {
  try {
    const plan = await updateSubscriptionPlan(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Subscription plan updated successfully",
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update subscription plan",
    });
  }
};

export const deleteSubscriptionPlanController = async (req, res) => {
  try {
    const plan = await deleteSubscriptionPlan(req.params.id);

    res.status(200).json({
      success: true,
      message: "Subscription plan deleted successfully",
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete subscription plan",
    });
  }
};


// userController


export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch users",
    });
  }
};

export const getUserByIdController = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message || "Failed to fetch user",
    });
  }
};

export const updateUserController = async (req, res) => {
  try {
    const updatedUser = await updateUser(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update user",
    });
  }
};

export const deleteUserController = async (req, res) => {
  try {
    const deletedUser = await deleteUser(req.params.id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete user",
    });
  }
};

//scoreController


export const selectCharityController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { charityId, contributionPercentage } = req.body;

    const updatedUser = await selectCharityService(
      userId,
      charityId,
      contributionPercentage
    );

    return res.status(200).json({
      success: true,
      message: "Charity selected successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("selectCharityController error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const selectSubscriptionController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { subscriptionId } = req.body;

    console.log("User ID:", userId);
    console.log("Subscription ID:", subscriptionId);

    const updatedUser = await selectSubscriptionService(userId, subscriptionId);

    console.log("Updated User:", updatedUser);

    return res.status(200).json({
      success: true,
      message: "Subscription selected successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteScoreController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { scoreId } = req.params;

    const updatedUser = await deleteScoreService(userId, scoreId);

    return res.status(200).json({
      success: true,
      message: "Score deleted successfully",
      data: {
        scores: updatedUser.scores,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete score",
    });
  }
};

export const addScoreController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { stableford, date, course } = req.body;

    const updatedScores = await addScoreService(userId, stableford, date, course);

    return res.status(200).json({
      success: true,
      message: "Score added successfully",
      scores: updatedScores,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to add score",
    });
  }
};

//run the draw

export const runDrawController = async (req, res) => {
  try {
    console.log("RUN DRAW CONTROLLER HIT:", {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      time: new Date().toISOString(),
    });

    const result = await runDrawService();

    return res.status(200).json({
      success: true,
      message: "Draw completed successfully",
      data: result,
    });
  } catch (error) {
    console.error("RUN DRAW CONTROLLER ERROR:", {
      message: error.message,
      stack: error.stack,
      time: new Date().toISOString(),
    });

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to run draw",
    });
  }
};