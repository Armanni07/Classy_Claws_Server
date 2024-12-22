import express, { IRouter } from "express";

import {
  CreateDamagedItems,
  UpdateDamagedItems,
  DeleteDamagedItems,
  RetrieveDamagedItems,
} from "../Connections/DamagedItems";

const Router: IRouter = express.Router();

Router.post("/post", CreateDamagedItems);
Router.get("/get", RetrieveDamagedItems);
Router.put("/put", UpdateDamagedItems);
Router.delete("/delete/:id", DeleteDamagedItems);

export default Router;
