import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import express, { Express } from "express";

import CartRoute from "./Routes/Cart";
import MailRoute from "./Routes/Mail";
import AdminRoute from "./Routes/Admin";
import SalesRoute from "./Routes/Sales";
import UsersRoute from "./Routes/Users";
import ProductsRoute from "./Routes/Products";
import EmployeesRoute from "./Routes/Employees";
import CategoriesRoute from "./Routes/Categories";
import DamagedItemsRoute from "./Routes/DamagedItems";

const port: number = 5000;
const app: Express = express();
const server = http.createServer(app);

// Enable CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

//Set Up Express
app.use(express());
app.use(express.urlencoded({ extended: true }));

// Set Up JSON Body Parsing
app.use(express.json({ limit: "50mb" }));

//Set Up Cookie Parser
app.use(cookieParser());

// Import Routes
app.use("/api/cart", CartRoute);
app.use("/api/mail", MailRoute);
app.use("/api/admin", AdminRoute);
app.use("/api/sales", SalesRoute);
app.use("/api/users", UsersRoute);
app.use("/api/products", ProductsRoute);
app.use("/api/employees", EmployeesRoute);
app.use("/api/categories", CategoriesRoute);
app.use("/api/damaged-items", DamagedItemsRoute);

// Listen For Server

server.listen(port, () => {
  console.log(`Server is running on: http://localhost:${port}`);
});
