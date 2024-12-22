import express, { IRouter } from "express";
import {
  TopSales,
  CreateSales,
  DeleteSales,
  TopSalesUser,
  RetrieveSales,
  TopSalesCategory,
  UpdateSales,
  ConfirmSales,
  RetrieveActiveSales,
  RetrieveActiveUserSales,
  RetrieveDeliverSales,
} from "../Connections/Sales";

const Router: IRouter = express.Router();

Router.put("/put", UpdateSales);
Router.get("/get/top", TopSales);
Router.post("/post", CreateSales);
Router.get("/get", RetrieveSales);
Router.delete("/delete", DeleteSales);
Router.get("/get/top/user", TopSalesUser);
Router.put("/admin/put/:id", ConfirmSales);
Router.get("/get/active", RetrieveActiveSales);
Router.get("/get/delivery", RetrieveDeliverSales);
Router.get("/get/top/products/:id", TopSalesCategory);
Router.get("/get/active/:id", RetrieveActiveUserSales);

export default Router;
