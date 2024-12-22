import moment from "moment";
import { Request, Response } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";

import { Query } from "../Functions/CRUD";
import {
  DeleteProps,
  DamagedItemsInterface,
  ProductsInterface,
} from "../Interfaces/DatabaseInterfaces";
import { database } from "./Connect";

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY as string;

export const CreateDamagedItems = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;

  const CreateQuery: string = `
  INSERT INTO Damaged_Items
  (Product_ID, Quantity, Description, Created_By, Updated_By, Date_Created, Date_Updated) 
  VALUES (?,?,?,?,?,?,?)`;

  const UpdateQuery: string = `
  UPDATE Damaged_Items 
    SET Quantity = ?,
        Updated_By = ?,
        Date_Updated = ?
  WHERE Product_ID = ?`;

  const UpdateProductQuery: string = `
  UPDATE Products
   SET Unit = ?,
       Status = ?
  WHERE id = ?`;

  const ProductQuery: string = `SELECT * FROM Products WHERE id = ?`;
  const CheckQuery: string = `SELECT * FROM Damaged_Items WHERE Product_ID = ?`;

  const { ProductId, Quantity, Description } = req.body;

  const Date_Created = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
  const Date_Updated = null;

  jwt.verify(
    token,
    ADMIN_SECRET_KEY,
    (error: JsonWebTokenError | null, user: any) => {
      if (error || !user) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const Created_By: number = user.userId.id;
      const Updated_By: number | null = null;

      const DamagedItems: any[] = [
        ProductId,
        Quantity,
        Description,
        Created_By,
        Updated_By,
        Date_Created,
        Date_Updated,
      ];

      console.log(DamagedItems);

      database.query<DamagedItemsInterface[]>(
        CheckQuery,
        [ProductId],
        (error: Error | null, results) => {
          if (error) {
            console.log(error);
          }

          if (results.length > 0 && results[0].Description === Description) {
            console.log("Already Exists");

            results.map((result, i:number)=>{

            })

            database.query(
              UpdateQuery,
              [Quantity, Created_By, Date_Created, ProductId],
              (err: Error | null) => {
                if (err) {
                  console.log("Database Error:", error?.message);
                  return res.status(500).json({ error: "Database Error" });
                } else {
                  database.query<ProductsInterface[]>(
                    ProductQuery,
                    [ProductId],
                    (err: Error | null, result) => {
                      if (err) {
                        return res
                          .status(500)
                          .json({ error: "Database Error" });
                      }

                      const units = result[0].Unit - Quantity;
                      const status =
                        units < result[0].LowStockThreshold
                          ? "Low Stock"
                          : units === 0
                          ? "Out Of Stock"
                          : "In Stock";

                      database.query(
                        UpdateProductQuery,
                        [units, status, ProductId],
                        (err) => {
                          if (err) {
                            return res
                              .status(500)
                              .json({ error: "Database Error" });
                          }

                          res.status(201).json({
                            message: "Created successfully",
                          });
                        }
                      );
                    }
                  );
                }
              }
            );
          } else {
            database.query(CreateQuery, DamagedItems, (err: Error | null) => {
              if (err) {
                return res.status(500).json({ error: "Database Error" });
              }
              database.query<ProductsInterface[]>(
                ProductQuery,
                [ProductId],
                (err: Error | null, result) => {
                  if (err) {
                    return res.status(500).json({ error: "Database Error" });
                  }

                  const units = result[0].Unit - Quantity;
                  const status =
                    units < result[0].LowStockThreshold
                      ? "Low Stock"
                      : units === 0
                      ? "Out Of Stock"
                      : "In Stock";

                  database.query(
                    UpdateProductQuery,
                    [units, status, ProductId],
                    (err) => {
                      if (err) {
                        return res
                          .status(500)
                          .json({ error: "Database Error" });
                      }

                      res.status(201).json({
                        message: "Created successfully",
                      });
                    }
                  );
                }
              );
            });
          }
        }
      );
    }
  );
};

export const RetrieveDamagedItems = (req: Request, res: Response) => {
  const RetrieveQuery: string = `
  SELECT D.*, p.Name, p.Image, p.Unit, p.SalePrice
  FROM Damaged_Items as D
  JOIN Products as p ON D.Product_ID = p.id
  `;

  Query.retrieve<DamagedItemsInterface>({
    Res: res,
    RetrieveQuery: RetrieveQuery,
  });
};

export const RetrieveDamagedItem = (req: Request, res: Response) => {
  const RetrieveQuery: string = `
  SELECT D.*, p.Name, p.Description, p.Image, p.Unit, p.SalePrice
  FROM Damaged_Items as D
  JOIN Products as p 
    ON D.Product_ID = p.id
  WHERE D.Product_ID = ?
  `;

  const Inputs = req.params.id;

  Query.retrieve<DamagedItemsInterface>({
    Res: res,
    Inputs,
    RetrieveQuery: RetrieveQuery,
  });
};

export const UpdateDamagedItems = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;

  const CheckQuery: string = `SELECT * FROM Damaged_Items WHERE id = ?`;
  const UpdateQuery: string = `UPDATE Damaged_Items 
  SET Quantity = ?;
      Description = ?;
      Updated_By = ?;
      Date_Updated = ?;
      WHERE id = ?`;

  const { Quantity, Description } = req.body;

  const Date_Updated = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");

  jwt.verify(
    token,
    ADMIN_SECRET_KEY,
    (error: JsonWebTokenError | null, user: any) => {
      if (error) {
        console.log("Forbidden", error);
        return res.status(403).json({ error: "Forbidden" });
      }

      const Updated_By: number = user.userId.id;

      const DamagedItems = [Quantity, Description, Updated_By, Date_Updated];

      Query.update<DamagedItemsInterface>({
        Res: res,
        Inputs: DamagedItems,
        CheckInput: Updated_By,
        CheckQuery: CheckQuery,
        UpdateQuery: UpdateQuery,
      });
    }
  );
};

export const DeleteDamagedItems = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;
  const CheckQuery: string = `SELECT * FROM Damaged_Items WHERE id = ?`;
  const DeleteQuery: string = `DELETE FROM Damaged_Items WHERE id = ?`;

  const Id = req.params.id;
  const DamagedItems = [Id];

  jwt.verify(
    token,
    ADMIN_SECRET_KEY,
    (err: JsonWebTokenError | null, user: any) => {
      if (err || !user) {
        console.log("Forbidden", err);
        return res.status(403).json({ error: "Forbidden" });
      }
      Query.delete<DeleteProps>({
        Res: res,
        Inputs: DamagedItems,
        CheckQuery: CheckQuery,
        DeleteQuery: DeleteQuery,
      });
    }
  );
};
