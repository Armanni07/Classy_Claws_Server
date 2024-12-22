import express, { IRouter } from "express";

import {
  CartCount,
  CartTotal,
  CreateCart,
  DeleteCart,
  RetrieveCart,
} from "../Connections/Cart";

const Router: IRouter = express.Router();

Router.post("/post", CreateCart);
Router.get("/get", RetrieveCart);
Router.get("/get/total", CartTotal);
Router.get("/get/user/sales", CartCount);
Router.delete("/delete/:id", DeleteCart);

export default Router;
