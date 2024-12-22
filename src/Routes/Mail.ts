import express, { IRouter as Router } from "express";

import {
  CreateMail,
  DeleteMail,
  RetrieveMail,
  RetrieveUserMail,
} from "../Connections/Mail";

const Router: Router = express.Router();

Router.post("/post", CreateMail);
Router.get("/get", RetrieveMail);
Router.delete("/delete", DeleteMail);
Router.get("/get/:id", RetrieveUserMail);

export default Router;
