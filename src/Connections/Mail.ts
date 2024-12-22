import dotenv from "dotenv";
import moment from "moment";
import { Request, Response } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";

import { database } from "./Connect";
import { MailInterface } from "../Interfaces/DatabaseInterfaces";
import { Query } from "../Functions/CRUD";

dotenv.config();

const SECRET = process.env.SECRET_KEY as string;
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY as string;

export const CreateMail = (req: Request, res: Response) => {
  const token = req.cookies.accessToken;

  const CreateQuery: string = `
     INSERT INTO Mail (Messages, User_ID, Date)
     VALUES (?,?,?)`;

  const { message } = req.body;
  const date = moment(Date.now()).format("YY-MM-DD HH:mm:ss");

  if (!token) {
    return res.status(401).json({ error: "Unauthorised" });
  }

  jwt.verify(token, SECRET, (error: JsonWebTokenError | null, user: any) => {
    if (error) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const userId = user.userId.id;

    const Inputs = [message, userId, date];

    database.query<MailInterface[]>(CreateQuery, Inputs, (error, data) => {
      if (error) {
        return res.status(500).json({ error: "Database Error" });
      }

      return res.status(201).json({ message: "Sent!!" });
    });
  });
};

export const RetrieveMail = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;

  const RetrieveQuery: string = `
     SELECT Users.id, Users.Firstname, Users.Lastname, Users.Photo, Users.Status
     FROM Users 
     JOIN Mail
     ON Mail.User_ID = Users.id
     WHERE Mail.Messages != ""
     AND Mail.Messages IS NOT NULL
     GROUP BY Users.id, Users.Firstname, Users.Lastname, Users.Photo, Users.Status
     ORDER BY MAX(Mail.Date) DESC
     `;

  jwt.verify(token, ADMIN_SECRET, (error: JsonWebTokenError | null) => {
    if (error) {
      return res.status(403).json({ error: "Forbidden" });
    }

    Query.retrieve<MailInterface>({
      Res: res,
      RetrieveQuery,
    });
  });
};

export const RetrieveUserMail = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;

  const id: number = Number(req.params.id);

  const RetrieveQuery: string = `
     SELECT * FROM Mail
      WHERE Mail.Messages != ""
      AND User_ID = ?
      `;
  //  ORDER BY MAX(Date) DESC

  jwt.verify(token, ADMIN_SECRET, (error: JsonWebTokenError | null) => {
    if (error) {
      return res.status(403).json({ error: "Forbidden" });
    }

    Query.retrieve<MailInterface>({
      Res: res,
      Inputs: id,
      RetrieveQuery,
    });
  });
};

export const DeleteMail = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;

  const DeleteQuery: string = `
     DELETE FROM Mail
     WHERE User_ID =?`;

  const id: number = Number(req.params.id);

  jwt.verify(token, ADMIN_SECRET, (error: JsonWebTokenError | null) => {
    if (error) {
      return res.status(403).json({ error: "Forbidden" });
    }

    Query.delete<MailInterface>({ Res: res, Inputs: id, DeleteQuery });
  });
};
