import express, { IRouter } from "express";

import {
  CreateProduct,
  DeleteProduct,
  ProductsChart,
  UpdateProduct,
  SearchProducts,
  RetrieveProducts,
  RetrieveIdProducts,
} from "../Connections/Products";

const Router: IRouter = express.Router();

Router.post("/post", CreateProduct);
Router.get("/get", RetrieveProducts);
Router.put("/put/:id", UpdateProduct);
Router.get("/get/chart", ProductsChart);
Router.get("/search/:id", SearchProducts);
Router.get("/get/:id", RetrieveIdProducts);
Router.delete("/delete/:id", DeleteProduct);

export default Router;
