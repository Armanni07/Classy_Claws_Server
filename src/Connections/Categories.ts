import moment from "moment";
import { Request, Response } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";

import {
  DeleteProps,
  CategoriesInterface,
} from "../Interfaces/DatabaseInterfaces";
import { Query } from "../Functions/CRUD";

const SECRET_KEY = process.env.SECRET_KEY as string;
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY as string;

export const CreateCategories = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;

  if (!token) {
    console.log("Unauthorised");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const CheckQuery: string = `SELECT * FROM Categories WHERE Name = ?`;
  const CreateQuery: string = `INSERT INTO Categories(Name, Description, Created_By, Updated_By, Date_Created, Date_Updated) VALUES(?,?,?,?,?,?)`;

  const { name, description } = req.body;

  const Date_Created = moment().format("YYYY-MM-DD HH:mm:ss");
  const Date_Updated = null;

  if (!name || !description) {
    return res.status(400).json({ error: "Name and description are required" });
  }

  jwt.verify(
    token,
    ADMIN_SECRET_KEY,
    (error: JsonWebTokenError | null, user: any) => {
      if (error || !user) {
        console.log("Forbidden", error);
        return res.status(403).json({ error: "Forbidden" });
      }

      const Created_By = user.userId.id;
      const Updated_By = null;

      const Categories: any[] = [
        name,
        description,
        Created_By,
        Updated_By,
        Date_Created,
        Date_Updated,
      ];

      Query.create<CategoriesInterface>({
        Res: res,
        Inputs: Categories,
        CheckInput: name,
        CheckQuery,
        CreateQuery,
      });
    }
  );
};

export const CreateIdCategories = (req: Request, res: Response) => {
  const token = req.cookies.employeeToken;

  if (!token) {
    console.log("Unauthorised");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const CheckQuery: string = `SELECT * FROM Categories WHERE Name = ?`;
  const CreateQuery: string = `INSERT INTO Categories(Name, Description, Created_By, Updated_By, Date_Created, Date_Updated) VALUES(?,?,?,?,?,?)`;

  const { name, description } = req.body;

  const Date_Created = moment().format("YYYY-MM-DD HH:mm:ss");
  const Date_Updated = null;

  if (!name || !description) {
    return res.status(400).json({ error: "Name and description are required" });
  }

  jwt.verify(
    token,
    SECRET_KEY,
    (error: JsonWebTokenError | null, user: any) => {
      console.log(user.id);

      if (error || !user) {
        console.log("Forbidden", error);
        return res.status(403).json({ error: "Forbidden" });
      }

      const Created_By = req.params.id;
      const Updated_By = 0;

      const Categories: any[] = [
        name,
        description,
        Created_By,
        Updated_By,
        Date_Created,
        Date_Updated,
      ];

      Query.create({
        Res: res,
        Inputs: Categories,
        CheckInput: name,
        CheckQuery,
        CreateQuery,
      });
    }
  );
};

export const RetrieveCategories = (_: Request, res: Response) => {
  const RetrieveQuery: string = `SELECT * FROM Categories`;

  Query.retrieve<CategoriesInterface>({
    Res: res,
    RetrieveQuery: RetrieveQuery,
  });
};

export const RetrieveCategoryProducts = (req: Request, res: Response) => {
  const RetrieveQuery: string = `
  SELECT Categories.Name,
  JSON_ARRAYAGG(
   JSON_OBJECT(
   'Name', Products.Name, 
   'Price', Products.SalePrice,
   )
  ) as Products
  FROM Categories
  LEFT JOIN Products ON Categories.id = Products.Category_Id
  WHERE Categories.Description LIKE ?
  GROUP BY Categories.Name
  `;

  const { Description } = req.body;

  Query.retrieve<CategoriesInterface>({
    Res: res,
    Inputs: [Description],
    RetrieveQuery: RetrieveQuery,
  });
};

export const RetrieveProductCategories = (req: Request, res: Response) => {
  const RetrieveQuery: string = `
  SELECT 
    Products.*,
    JSON_OBJECT(
     'Name', Categories.Name
    ) as Category
  FROM Products
  JOIN Categories ON Products.Category_Id = Categories.id
  WHERE Products.Description LIKE ?
  `;

  const Description = req.params.id;
  const Inputs: string[] = [`%${Description}%`];

  Query.retrieve<CategoriesInterface>({
    Res: res,
    Inputs,
    RetrieveQuery: RetrieveQuery,
  });
};

export const RetrieveIdCategories = (req: Request, res: Response) => {
  const id = req.params.id;
  const token = req.cookies.employeeToken;

  const RetrieveQuery: string = `SELECT * FROM Categories WHERE CreatedBy = ?`;

  jwt.verify(
    token,
    SECRET_KEY,
    (error: JsonWebTokenError | null, user: any) => {
      console.log(user.id);

      if (error || !user) {
        console.log("Forbidden", error);
        return res.status(403).json({ error: "Forbidden" });
      }

      const Categories: string[] = [id];

      Query.retrieve<CategoriesInterface>({
        Res: res,
        Inputs: Categories,
        RetrieveQuery: RetrieveQuery,
      });
    }
  );
};

export const UpdateCategories = (req: Request, res: Response) => {
  const CheckQuery: string = `SELECT * FROM Categories WHERE id = ?`;
  const UpdateQuery: string = `
  UPDATE Categories 
  SET Name = ?, 
      Description = ?, 
      Updated_By? = ?;
      Date_Updated? = ?;
      WHERE id = ?
      `;

  const { Name, Description } = req.body;

  const Date_Updated = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");

  const Updated_By: number = req.body.id;

  const Categories = [Name, Description, Updated_By, Date_Updated];

  Query.update<CategoriesInterface>({
    Res: res,
    Inputs: Categories,
    CheckInput: Name,
    CheckQuery: CheckQuery,
    UpdateQuery: UpdateQuery,
  });
};

export const DeleteCategories = (req: Request, res: Response) => {
  const CheckQuery: string = `SELECT * FROM Categories WHERE id = ?`;
  const DeleteQuery: string = `DELETE FROM Categories WHERE id = ?`;

  const Id = req.params.id;
  const Categories = [Id];

  Query.delete<DeleteProps>({
    Res: res,
    Inputs: Categories,
    CheckQuery: CheckQuery,
    DeleteQuery: DeleteQuery,
  });
};
