import moment from "moment";
import dotenv from "dotenv";
import { Request, Response } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";

import { Query } from "../Functions/CRUD";
import { database } from "../Connections/Connect";
import { CartInterface } from "../Interfaces/DatabaseInterfaces";

dotenv.config();

const SecretKey: string = process.env.SECRET_KEY as string;

export const CreateCart = (req: Request, res: Response) => {
  const token = req.cookies.accessToken;

  const CheckQuery: string = `
  SELECT * FROM Cart 
  WHERE Product_ID = ? AND User_ID = ?
  `;

  const CreateQuery: string = `
  INSERT INTO Cart (Product_ID, Quantity, User_ID, Date_Added) 
  VALUES(?, ?, ?, ?)
  `;

  const UpdateQuery: string = `
  UPDATE Cart 
  SET  Quantity = ? 
  WHERE User_ID = ? AND Product_ID = ?
  `;

  const DeleteQuery: string = `DELETE FROM Cart WHERE Product_ID = ? AND User_ID = ? `;

  let { Product_ID, Quantity } = req.body;

  const CreateQuantity = Quantity === null ? 1 : Quantity;
  console.log(CreateQuantity);
  console.log(Quantity);

  if (!token) {
    console.log("Unauthorised");
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, SecretKey, (err: JsonWebTokenError | null, user: any) => {
    if (err) {
      console.log("Forbidden", err);
      return res.status(403).json({ error: "Forbidden" });
    }

    const userId = user.userId.id;
    const Date_Added = moment().format("YYYY-MM-DD HH:mm:ss");

    database.query<CartInterface[]>(
      CheckQuery,
      [Product_ID, userId],
      (err, results) => {
        if (err) {
          console.log("Error creating cart", err);
          return res.status(500).json({ error: err });
        }

        if (results.length > 0) {
          if (Quantity <= 0 || Quantity === null || Quantity === undefined) {
            Query.delete({
              Res: res,
              Inputs: [Product_ID, userId],
              DeleteQuery,
            });
          } else {
            database.query<CartInterface[]>(
              UpdateQuery,
              [Quantity, userId, Product_ID],
              (err, results) => {
                if (err) {
                  console.log("Error updating cart", err);
                  return res.status(500).json({ error: err });
                } else {
                  res.status(200).json({
                    message: "Cart updated successfully",
                  });
                }
              }
            );
          }
        } else {
          database.query<CartInterface[]>(
            CreateQuery,
            [Product_ID, CreateQuantity, userId, Date_Added],
            (err, results) => {
              if (err) {
                console.log("Error creating cart", err);
                return res.status(500).json({ error: err });
              } else {
                res.status(200).json({
                  message: "Added To Cart",
                });
              }
            }
          );
        }
      }
    );
  });
};

export const RetrieveCart = (req: Request, res: Response) => {
  const token = req.cookies.accessToken;
  const RetrieveQuery: string = `
  SELECT 
    Cart.*, 
    Products.Name, 
    Products.Unit, 
    Products.SalePrice, 
    Products.Image, 
    Products.Status
  FROM Cart 
  JOIN Products 
  ON Cart.Product_ID = Products.id
  WHERE Cart.User_ID = ?
`;

  if (!token) {
    console.log("Unauthorised");
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, SecretKey, (err: JsonWebTokenError | null, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden" });
    } else {
      const UserId = user.userId.id;
      Query.retrieve<CartInterface>({
        Res: res,
        Inputs: UserId,
        RetrieveQuery,
      });
    }
  });
};

export const CartTotal = (req: Request, res: Response) => {
  const token = req.cookies.accessToken;
  const RetrieveQuery: string = `
  SELECT 
    SUM(Cart.Quantity * Products.SalePrice) AS Total
  FROM Cart 
  JOIN Products 
  ON Cart.Product_ID = Products.id
  WHERE Cart.User_ID =?`;

  if (!token) {
    console.log("Unauthorised");
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, SecretKey, (err: JsonWebTokenError | null, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden" });
    } else {
      const UserId = user.userId.id;
      Query.retrieve<CartInterface>({
        Res: res,
        Inputs: UserId,
        RetrieveQuery,
      });
    }
  });
};

export const DeleteCart = (req: Request, res: Response) => {
  const token = req.cookies.accessToken;
  const CheckQuery: string = `SELECT * FROM Cart WHERE Product_ID AND User_ID = ?`;

  const DeleteQuery: string = `DELETE FROM Cart WHERE User_ID =? AND Product_ID =?`;

  const ProductId = req.params.id;

  if (!token) {
    console.log("Unauthorised");
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, SecretKey, (err: JsonWebTokenError | null, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden" });
    } else {
      const UserId = user.userId.id;

      Query.delete({
        Res: res,
        Inputs: [UserId, ProductId],
        CheckQuery,
        DeleteQuery,
      });
    }
  });
};

export const CartCount = (req: Request, res: Response) => {
  const token: string = req.cookies.accessToken;

  const RetrieveQuery: string = `
  SELECT SUM(Quantity) as CartCount
  FROM Cart 
  WHERE User_ID = ?
  `;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, SecretKey, (error: Error | null, user: any) => {
    if (error) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const userId = user.userId.id;

    Query.retrieve<CartInterface>({
      Res: res,
      Inputs: userId,
      RetrieveQuery: RetrieveQuery,
    });
  });
};
