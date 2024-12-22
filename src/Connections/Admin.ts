import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

import { database } from "./Connect";
import { Query } from "../Functions/CRUD";
import { Admin, User } from "../Interfaces/AuthInterfaces";

dotenv.config();

const SECRET_KEY = process.env.ADMIN_SECRET_KEY as string;

// Sign In
export const Login = (req: Request, res: Response) => {
  const EmailQuery: string = `SELECT * FROM Staff WHERE Email = ?`;

  const { email, password } = req.body;

  database.query<Admin[]>(EmailQuery, [email], (err: Error | null, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    } else if (results.length > 0) {
      const hashedPassword = results[0].Password;

      bcrypt.compare(password, hashedPassword, (error, result) => {
        if (error) {
          console.log(error);
          return res.status(401).json({ error: "Incorrect Email or Password" });
        } else {
          console.log(result);
          const { Password, ...data } = results[0];

          console.log(data);

          const token = jwt.sign({ userId: data }, SECRET_KEY, {
            expiresIn: "2d",
          });

          res
            .cookie("adminToken", token, {
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


//Logout
export const Logout = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;

  if (!token) {
    return res.status(401).json({ error: "No admin token found" });
  }
  jwt.verify(
    token,
    process.env.ADMIN_SECRET_KEY as string,
    (err: Error | null, user: any) => {
      if (err) {
        return res.status(403).json({ error: "Forbidden" });
      }

      console.log("Hit");
      res.clearCookie("adminToken", { sameSite: true });
      res.status(200).json({ message: "Logged out successfully" });
    }
  );
};

//Delete User
export const DeleteUser = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;
  const query: string = "DELETE FROM Admin WHERE id =?";

  const { userId } = req.body;

  jwt.verify(
    token,
    process.env.SECRET_KEY as string,
    (err: Error | null, user: any) => {
      if (err) {
        return res.status(403).json({ error: "Unauthorized" });
      } else {
        if (user.userId === userId) {
          database.query(
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

//Get User
export const GetStaff = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;
  const query: string = "SELECT * FROM Staff";

  jwt.verify(token, SECRET_KEY as string, (err: Error | null, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden" });
    } else {
      Query.retrieve<User>({ Res: res, RetrieveQuery: query });
    }
  });
};

//Get StaffId
export const GetIdStaff = (req: Request, res: Response) => {
  const id = req.params.id;
  const token = req.cookies.adminToken;

  const RetrieveQuery: string = `SELECT* FROM Staff WHERE id = ?`;

  jwt.verify(token, SECRET_KEY as string, (err: Error | null, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden" });
    } else {
      Query.retrieve<User>({ Res: res, Inputs: id, RetrieveQuery });
    }
  });
};

export const GetUser = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;
  const query: string = "SELECT * FROM Users";

  jwt.verify(token, SECRET_KEY as string, (err: Error | null, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden" });
    } else {
      Query.retrieve<User>({ Res: res, RetrieveQuery: query });
    }
  });
};

//Get User Id
export const GetIdUser = (req: Request, res: Response) => {
  const id = req.params.id;
  const token = req.cookies.adminToken;

  const RetrieveQuery: string = `
SELECT Users.*,
JSON_ARRAYAGG(
    JSON_OBJECT(
        'Name', p.Name,
        'Price', p.SalePrice,
        'Description', p.Description,
        'Quantity', s.Quantity
    )
) as Purchases
FROM Users
LEFT JOIN Sales as s ON (Users.id = s.Bought_By)
LEFT JOIN Products as p ON (p.id = s.Product_ID)
WHERE Users.id = ?
`;

  jwt.verify(token, SECRET_KEY as string, (err: Error | null, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden" });
    } else {
      Query.retrieve<User>({ Res: res, Inputs: id, RetrieveQuery });
    }
  });
};

//Get User Id
export const GetUserList = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;

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
GROUP BY Users.id
`;

  jwt.verify(token, SECRET_KEY as string, (err: Error | null, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden" });
    } else {
      Query.retrieve<User>({ Res: res, RetrieveQuery });
    }
  });
};

{
  // // Sign Up
  // export const Register = (req: Request, res: Response) => {
  //   const checkQuery: string = "SELECT * FROM Staff WHERE Email = ?";
  //   const query: string = `INSERT INTO Staff(Firstname, Lastname, Email, Password, Designation, Phone_No, Location, Employer) VALUES (?,?,?,?,?,?,?,?)`;
  //   const {
  //     firstname,
  //     lastname,
  //     email,
  //     password,
  //     designation,
  //     phoneNumber,
  //     location,
  //   } = req.body;
  //   const Employer: null = null;
  //   database.query(checkQuery, [email], (err: Error | null, results: any[]) => {
  //     if (err) {
  //       return res.status(500).json({ error: err });
  //     } else if (results.length > 0) {
  //       return res.status(409).json({ error: "User already exists" });
  //     } else {
  //       const hashedPassword = bcrypt.hashSync(password, 10);
  //       database.query(
  //         query,
  //         [
  //           firstname,
  //           lastname,
  //           email,
  //           hashedPassword,
  //           designation,
  //           phoneNumber,
  //           location,
  //           Employer,
  //         ],
  //         (err: Error | null, results: any[]) => {
  //           if (err) {
  //             return res.status(500).json({ error: err });
  //           } else {
  //             res.status(201).json({ message: "User created successfully" });
  //           }
  //         }
  //       );
  //     }
  //   });
  // };
}
