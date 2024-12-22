import dotenv from "dotenv";
import bcrypt from "bcrypt";
import moment from "moment";
import { Request, Response } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";

import { database } from "./Connect";
import { Query } from "../Functions/CRUD";
import { User } from "../Interfaces/AuthInterfaces";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY as string;

// Sign In
export const Login = (req: Request, res: Response) => {
  const EmailQuery: string = `SELECT * FROM Users WHERE Email = ?`;

  const { email, password } = req.body;

  database.query<User[]>(EmailQuery, [email], (err: Error | null, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    } else if (results.length > 0) {
      const hashedPassword = results[0].Password;

      bcrypt.compare(password, hashedPassword, (error, result) => {
        if (error) {
          console.log(error);
          return res.status(401).json({ error: "Incorrect Email or Password" });
        } else {
          const { Password, Photo, ...data } = results[0];

          const token = jwt.sign({ userId: data }, SECRET_KEY, {
            expiresIn: "2d",
          });

          res
            .cookie("accessToken", token, {
              httpOnly: true,
              maxAge: 48 * 60 * 60 * 1000,
            })
            .status(200)
            .json({ message: "Welcome Back!" });
        }
      });
    }
  });
};

// Sign Up
export const Register = (req: Request, res: Response) => {
  const checkQuery: string = "SELECT * FROM Users WHERE Email = ?";
  const query: string = `
  INSERT INTO Users (Firstname, Lastname, Email, Password, Phone_No, Location, Photo, Status) 
  VALUES (?,?,?,?,?,?,?,?)`;

  const { Firstname, Lastname, Email, Password, Phone_No, Location, Photo } =
    req.body;

  database.query<User[]>(checkQuery, [Email], (err: Error | null, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    } else if (results.length > 0) {
      return res.status(409).json({ error: "Email already exists" });
    } else {
      const hashedPassword = bcrypt.hashSync(Password, 10);
      const Status = "Regular";

      database.query<User[]>(
        query,
        [
          Firstname,
          Lastname,
          Email,
          hashedPassword,
          Phone_No,
          Location,
          Photo,
          Status,
        ],
        (err: Error | null, results: any[]) => {
          if (err) {
            return res.status(500).json({ error: err });
          } else {
            res.status(201).json({ message: "User created successfully" });
          }
        }
      );
    }
  });
};

// Sign Out
export const Logout = (req: Request, res: Response) => {
  // const UpdateQuery: string = `UPDATE Users SET Last_Active = ? WHERE id = ?`;

  console.log("Hit");
  res.clearCookie("accessToken", { sameSite: true });
  res.status(200).json({ message: "Logged out successfully" });
};

//Delete User
export const DeleteUser = (req: Request, res: Response) => {
  const token = req.cookies.accessToken;
  const query: string = "DELETE FROM Users WHERE User_ID =?";

  const { userId } = req.body;

  jwt.verify(
    token,
    process.env.SECRET_KEY as string,
    (err: Error | null, user: any) => {
      if (err) {
        return res.status(403).json({ error: "Unauthorized" });
      } else {
        if (user.userId === userId) {
          database.query<User[]>(
            query,
            [userId],
            (err: Error | null, results: any[]) => {
              if (err) {
                return res.status(500).json({ error: err });
              } else {
                res.status(200).json({ message: "User deleted successfully" });
              }
            }
          );
        } else {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }
    }
  );
};

export const GetUser = (req: Request, res: Response) => {
  const token = req.cookies.accessToken;

  const RetrieveQuery = `SELECT * FROM Users WHERE id = ?`;

  jwt.verify(token, SECRET_KEY, (err: JsonWebTokenError | null, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden" });
    } else {
      const Inputs = user.userId.id;

      Query.retrieve<User>({ Res: res, Inputs, RetrieveQuery });
    }
  });
};

export const GetUserProfile = (req: Request, res: Response) => {
  const token = req.cookies.accessToken;

  const RetrieveQuery: string = `SELECT 
Users.*,
JSON_ARRAYAGG(
    JSON_OBJECT(
        'Name', p.Name,
        'Price', p.SalePrice,
        'Quantity', s.Quantity
    )
) as Purchases
FROM Users
LEFT JOIN Sales as s ON (Users.id = s.Bought_By)
LEFT JOIN Products as p ON (p.id = s.Product_ID)
WHERE Users.id = ?
GROUP BY Users.id
`;

  jwt.verify(token, SECRET_KEY as string, (err: Error | null, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden" });
    } else {
      const userId = user.userId.id;
      Query.retrieve<User>({ Res: res, Inputs: userId, RetrieveQuery });
    }
  });
};

export const Token = (req: Request, res: Response) => {
  const token = req.cookies.accessToken;

  jwt.verify(
    token,
    SECRET_KEY as string,
    (err: JsonWebTokenError | null, user: any) => {
      if (err) {
        return res.status(403).json({ error: "Forbidden" });
      } else {
        res.status(200).json({ token });
      }
    }
  );
};
