import express, { IRouter } from "express";

import { DeleteUser, Login, Logout, Register } from "../Connections/Employees";

const Router: IRouter = express.Router();

Router.post("/login", Login);
Router.post("/logout", Logout);
Router.post("/delete", DeleteUser);
Router.post("/register", Register);

export default Router;
