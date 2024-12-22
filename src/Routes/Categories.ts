import express, { IRouter } from "express";

import {
  CreateCategories,
  DeleteCategories,
  UpdateCategories,
  CreateIdCategories,
  RetrieveCategories,
  RetrieveCategoryProducts,
  RetrieveProductCategories,
} from "../Connections/Categories";

const Router: IRouter = express.Router();

Router.put("/put", UpdateCategories);
Router.get("/get", RetrieveCategories);
Router.post("/post", CreateCategories);
Router.post("/post/:id", CreateIdCategories);
Router.delete("/delete/:id", DeleteCategories);
Router.get("/get/category_products", RetrieveCategoryProducts);
Router.get("/get/product_category/:id", RetrieveProductCategories);

export default Router;
