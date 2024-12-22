import moment from "moment";
import { Request, Response } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";

import { Query } from "../Functions/CRUD";
import { ProcessSales } from "../Functions/Methods";
import { DeleteProps, SalesInterface } from "../Interfaces/DatabaseInterfaces";
import { database } from "./Connect";

const SECRET_KEY = process.env.SECRET_KEY as string;
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY as string;

export const CreateSales = (req: Request, res: Response) => {
  const token = req.cookies.accessToken;

  const CheckQuery: string = `SELECT * FROM Products WHERE id = ?`;
  const CreateQuery: string = `
  INSERT INTO Sales(Product_ID, Quantity, Price, Sales_Date, Bought_By, Status) 
  VALUES(?,?,?,?,?,?)`;

  const DeleteCart: string = `
  DELETE FROM Cart 
  WHERE Product_ID = ? 
  AND User_ID = ?
  `;

  const UpdateQuery: string = `UPDATE Products SET Unit = ?, Status = ? WHERE id = ?`;

  const sales: SalesInterface[] = req.body;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, SECRET_KEY, (err: jwt.VerifyErrors | null, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden" });
    } else {
      const parameters = {
        res,
        CheckQuery,
        CreateQuery,
        UpdateQuery,
        Status: "Pending",
        DeleteQuery: DeleteCart,
      };

      let errors: Error[] = [];
      let processed: number = 0;

      sales.forEach((sale) => {
        ProcessSales(sale, parameters, (err) => {
          processed++;

          if (processed === sales.length) {
            if (errors.length > 0) {
              res.status(400).json({ error: "Bad Request", err });
            } else {
              res.status(201).json({ message: "Request created " });
            }
          }
        });
      });
    }
  });
};

export const RetrieveSales = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;

  const RetrieveQuery: string = `
  SELECT Sales.*,
   P.Name, P.SalePrice, P.Image, 
   U.Firstname, U.Lastname, U.Photo 
  FROM Sales 
    JOIN Products as P
      ON Sales.Product_ID = P.id
    JOIN Users as U 
      ON Sales.Bought_By = U.id
  `;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, ADMIN_SECRET_KEY, (error: Error | null) => {
    if (error) {
      return res.status(403).json({ error: "Forbidden" });
    }

    Query.retrieve<SalesInterface>({
      Res: res,
      RetrieveQuery: RetrieveQuery,
    });
  });
};

export const RetrieveDeliverSales = (req: Request, res: Response) => {
  const token = req.cookies.accessToken;

  const RetrieveQuery: string = `
  SELECT Status 
  FROM Sales 
  WHERE Status = "Sending"
  AND Bought_By = ?
  `;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, SECRET_KEY, (error: Error | null, user: any) => {
    const Inputs = user.userId.id;

    if (error) {
      return res.status(403).json({ error: "Forbidden" });
    }

    Query.retrieve<SalesInterface>({
      Res: res,
      Inputs,
      RetrieveQuery
    });
  });
};

export const RetrieveActiveSales = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;

  const SORT_SIZE: string = `
  SET SESSION 
    sort_buffer_size = 1024 * 1024 *10
  `;

  const RetrieveQuery: string = `
  SELECT
   U.id, U.Firstname, U.Lastname, U.Photo,
   JSON_ARRAYAGG(
    JSON_OBJECT(
      'SalesId', S.Id
        )
      ) as Sales
  FROM Users as U

    JOIN Sales as S 
      ON U.id = S.Bought_By
    JOIN Products as P
      ON P.id = S.Product_ID 

  WHERE S.Status = "Pending"
  GROUP BY U.id, U.Firstname, U.Lastname, U.Photo
  `;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, ADMIN_SECRET_KEY, (error: Error | null) => {
    if (error) {
      return res.status(403).json({ error: "Forbidden" });
    }

    database.query(SORT_SIZE, (err: Error) => {
      if (err) {
        return res.status(500).json({ error: err });
      } else {
        Query.retrieve<SalesInterface>({
          Res: res,
          RetrieveQuery: RetrieveQuery,
        });
      }
    });
  });
};

export const RetrieveActiveUserSales = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;
  const id = req.params.id;

  const RetrieveQuery: string = `
  SELECT S.*,
   P.Name, P.SalePrice, P.Image, 
   U.Firstname, U.Lastname, U.Photo 
  FROM Users as U
  
    JOIN Sales as S 
      ON U.id = S.Bought_By

    JOIN Products as P
      ON P.id = S.Product_ID 

  WHERE S.Status = "Pending"
  AND U.id = ?
  `;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, ADMIN_SECRET_KEY, (error: Error | null) => {
    if (error) {
      return res.status(403).json({ error: "Forbidden" });
    }

    Query.retrieve<SalesInterface>({
      Res: res,
      Inputs: id,
      RetrieveQuery: RetrieveQuery,
    });
  });
};

export const UpdateSales = (req: Request, res: Response) => {
  const token = req.cookies.accessToken;

  const CheckQuery: string = `
  SELECT * 
  FROM Sales 
  WHERE Status = "Sending"
  AND Bought_By = ?`;

  const UpdateQuery: string = `
  UPDATE Sales
  SET Status = "Completed"
  WHERE Bought_By = ?
  `;

  jwt.verify(token, SECRET_KEY, (err: JsonWebTokenError | null, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    const userId = user.userId.id;
    // const Inputs = [userId];

    database.query(
      CheckQuery,
      [userId],
      (err: Error | null, results: any[]) => {
        if (err) {
          return res.status(500).json({ error: err });
        }
        if (results.length === 0) {
          return res.status(404).json({ error: "Not found" });
        }

        results.forEach(() => {
          database.query(UpdateQuery, [userId], (err: Error | null) => {
            if (err) {
              return res.status(500).json({ error: err });
            }
            res.status(200).json({ message: "Sales confirmed" });
          });
        });
      }
    );

    // Query.update<SalesInterface>({
    //   Res: res,
    //   Inputs,
    //   CheckInput: userId,
    //   CheckQuery: CheckQuery,
    //   UpdateQuery: UpdateQuery,
    // });
  });
};

export const ConfirmSales = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;
  const id = req.params.id;

  const CheckQuery: string = `
  SELECT * 
  FROM Sales 
    WHERE Status = "Pending"
    AND Bought_By = ?
  `;

  const UpdateQuery: string = `
  UPDATE Sales
  SET Status = "Sending"
  WHERE Bought_By = ?
  `;

  jwt.verify(
    token,
    ADMIN_SECRET_KEY,
    (err: JsonWebTokenError | null, _: any) => {
      const Inputs = [id];

      if (err) {
        return res.status(403).json({ error: "Forbidden" });
      }

      database.query(CheckQuery, [id], (err: Error | null, results: any[]) => {
        if (err) {
          return res.status(500).json({ error: "Database ERROR" });
        }

        results.forEach(() => {
          database.query(UpdateQuery, Inputs, (error: Error | null) => {
            if (error) {
              console.log("Error updating record: ", error);
            } else {
              console.log("Record updated successfully");
            }
          });
        });
      });
    }
  );
};

export const DeleteSales = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;
  const CheckQuery: string = `SELECT * FROM Sales WHERE id = ?`;
  const DeleteQuery: string = `DELETE FROM Sales WHERE id = ?`;

  const Id = req.params.id;
  const Sales = [Id];

  jwt.verify(
    token,
    ADMIN_SECRET_KEY,
    (err: JsonWebTokenError | null, response: any) => {
      if (err) {
        console.log("Forbidden", err);
        return res.status(403).json({ error: "Forbidden" });
      }

      Query.delete<DeleteProps>({
        Res: res,
        Inputs: Sales,
        CheckQuery: CheckQuery,
        DeleteQuery: DeleteQuery,
      });
    }
  );
};

export const TopSales = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;
  const RetrieveQuery: string = `
  SELECT Sales.*, p.Name, p.SalePrice
  FROM Sales 
  LEFT JOIN Products as p ON (Sales.Product_ID = p.id)
  ORDER BY Quantity DESC LIMIT 10`;

  jwt.verify(
    token,
    ADMIN_SECRET_KEY,
    (err: JsonWebTokenError | null, response: any) => {
      if (err) {
        console.log("Forbidden", err);
        return res.status(403).json({ error: "Forbidden" });
      }

      Query.retrieve<SalesInterface>({
        Res: res,
        RetrieveQuery: RetrieveQuery,
      });
    }
  );
};

export const TopSalesUser = (_: Request, res: Response) => {
  const RetrieveQuery: string = `
  SELECT Sales.*, p.Name, p.Description, p.SalePrice, p.Image
  FROM Sales 
  LEFT JOIN Products as p ON (Sales.Product_ID = p.id)
  ORDER BY Quantity DESC LIMIT 10`;

  Query.retrieve<SalesInterface>({
    Res: res,
    RetrieveQuery: RetrieveQuery,
  });
};

export const TopSalesCategory = (req: Request, res: Response) => {
  const RetrieveQuery: string = `
  SELECT Sales.*, p.Name, p.SalePrice, p.Image
  FROM Sales 
  LEFT JOIN Products as p 
  ON Sales.Product_ID = p.id
  WHERE p.Description LIKE ?
  LIMIT 3`;

  const Description = req.params.id;
  const Inputs = [`%${Description}%`];

  console.log(Inputs);
  Query.retrieve<SalesInterface>({
    Res: res,
    Inputs,
    RetrieveQuery: RetrieveQuery,
  });
};
