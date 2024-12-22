import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

import { database } from "./Connect";
import { Employee } from "../Interfaces/AuthInterfaces";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY as string;
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY as string;

// Sign In
export const Login = (req: Request, res: Response) => {
  const EmailQuery: string = `SELECT * FROM Users WHERE Email = ?`;

  const { email, password } = req.body;

  database.query<Employee[]>(
    EmailQuery,
    [email],
    (err: Error | null, results) => {
      if (err) {
        return res.status(500).json({ error: err });
      } else if (results.length > 0) {
        const hashedPassword = results[0].Password;

        bcrypt.compare(password, hashedPassword, (error, result) => {
          if (error) {
            console.log(error);
            return res
              .status(401)
              .json({ error: "Incorrect Email or Password" });
          } else {
            console.log(result);
            const { Password, ...data } = results[0];

            console.log(data);

            const token = jwt.sign({ userId: data }, SECRET_KEY, {
              expiresIn: "1d",
            });

            res
              .cookie("employeeToken", token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
              })
              .status(200)
              .json({ message: "Welcome Back!" });
          }
        });
      }
    }
  );
};

// Sign Up
export const Register = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;
  const checkQuery: string = `SELECT * FROM Staff WHERE Email = ?`;

  const query: string = `INSERT INTO Staff(Firstname, Lastname, Email, Password, Designation, Phone_No, Location, Employer, Photo) VALUES (?,?,?,?,?,?,?,?,?)`;

  const {
    firstname,
    lastname,
    email,
    password,
    designation,
    phoneNumber,
    location,
    photo,
  } = req.body;

  jwt.verify(token, ADMIN_SECRET_KEY, (error: Error | null, admin: any) => {
    if (error) {
      return res.status(401).json({ error: "Unauthorized" });
    } else {
      const employer = admin.userId.id;

      database.query(
        checkQuery,
        [email],
        (err: Error | null, results: any[]) => {
          if (err) {
            return res.status(500).json({ error: err });
          } else if (results.length > 0) {
            return res.status(409).json({ error: "User already exists" });
          } else {
            const hashedPassword = bcrypt.hashSync(password, 10);

            database.query(
              query,
              [
                firstname,
                lastname,
                email,
                hashedPassword,
                designation,
                phoneNumber,
                location,
                employer,
                photo,
              ],
              (err: Error | null, results: any[]) => {
                if (err) {
                  return res.status(500).json({ error: err });
                } else {
                  res
                    .status(201)
                    .json({ message: "Employee created successfully" });
                }
              }
            );
          }
        }
      );
    }
  });
};

// Sign Out
export const Logout = (req: Request, res: Response) => {
  res.clearCookie("accessToken", { sameSite: true });
  res.status(200).json({ message: "Logged out successfully" });
};

//Delete User
export const DeleteUser = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;
  const query: string = "DELETE FROM Users WHERE User_ID =?";

  const { userId } = req.body;

  jwt.verify(token, ADMIN_SECRET_KEY, (err: Error | null, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Unauthorized" });
    } else {
      if (userId) {
        database.query(query, [userId], (err: Error | null, results: any[]) => {
          if (err) {
            return res.status(500).json({ error: err });
          } else {
            res.status(200).json({ message: "User deleted successfully" });
          }
        });
      } else {
        return res.status(403).json({ error: "Unauthorized" });
      }
    }
  });
};
