import express, { IRouter } from "express";

import {
  Login,
  Token,
  Logout,
  GetUser,
  Register,
  DeleteUser,
  GetUserProfile,
} from "../Connections/Users";

const Router: IRouter = express.Router();

Router.get("/get", GetUser);
Router.post("/login", Login);
Router.post("/logout", Logout);
Router.get("/get/token", Token);
Router.post("/register", Register);
Router.put("/update/:id", Register);
Router.delete("/delete/:id", DeleteUser);
Router.get("/get/profile", GetUserProfile);

export default Router;
