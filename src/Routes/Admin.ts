import express, { IRouter } from "express";

import {
  Logout,
  Login,
  GetUser,
  GetStaff,
  GetIdUser,
  DeleteUser,
  GetIdStaff,
  GetUserList,
} from "../Connections/Admin";

const Router: IRouter = express.Router();

Router.post("/login", Login);
Router.post("/logout", Logout);
Router.post("/delete", DeleteUser);

Router.get("/get/users", GetUser);
Router.get("/get/employee", GetStaff);
Router.get("/get/users/:id", GetIdUser);
Router.get("/get/users-list", GetUserList);
Router.get("/get/employee/:id", GetIdStaff);

export default Router;
