import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized Request" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized - Invalid Token" });
    }

    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: "No User Found" });
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in protectRoute Middleware", error.message);
  }
};

export default protectRoute;
