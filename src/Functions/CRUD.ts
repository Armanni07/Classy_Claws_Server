import dotenv from "dotenv";
import { RowDataPacket } from "mysql2";

import {
  CreateType,
  DeleteType,
  UpdateType,
  RetrieveType,
} from "../Types/CRUDTypes";
import { database } from "../Connections/Connect";

dotenv.config();

function create<T extends RowDataPacket>({
  Res,
  Inputs,
  CheckQuery,
  CreateQuery,
}: CreateType) {
  database.query<T[]>(CheckQuery, [Inputs[0]], (err: Error | null, results) => {
    if (err) throw err;

    if (results.length > 0) {
      return Res.status(409).json({
        error: "Already exists, Please Update",
      });
    } else {
      database.query(CreateQuery, Inputs, (err: Error | null) => {
        if (err) {
          return Res.status(500).json({ error: "Database Error" });
        }

        Res.status(201).json({
          message: "Created successfully",
        });
      });
    }
  });
}

function retrieve<T extends RowDataPacket>({
  Res,
  Inputs,
  RetrieveQuery,
}: RetrieveType) {
  if (Inputs) {
    database.query<T[]>(RetrieveQuery, [Inputs], (err: Error | null, data) => {
      if (err) {
        throw err;
      }
      Res.status(200).json(data);
    });
  } else {
    database.query<T[]>(RetrieveQuery, (err: Error | null, data) => {
      if (err) throw err;
      Res.status(200).json(data);
    });
  }
}

function update<T extends RowDataPacket>({
  Res,
  Inputs,
  CheckInput,
  CheckQuery,
  UpdateQuery,
}: UpdateType) {
  database.query<T[]>(
    CheckQuery,
    [CheckInput],
    (err: Error | null, results) => {
      if (err) throw err;

      if (results.length === 0) {
        return Res.status(404).json({
          error: "Doesn't exists",
        });
      } else {
        database.query(UpdateQuery, Inputs, (err: Error | null) => {
          if (err) throw err;
          Res.status(201).json({
            message: "Updated successfully",
          });
        });
      }
    }
  );
}

function deleter<T extends RowDataPacket>({
  Res,
  Inputs,
  CheckQuery,
  DeleteQuery,
}: DeleteType) {
  CheckQuery
    ? database.query<T[]>(
        CheckQuery,
        [Inputs[0]],
        (err: Error | null, results) => {
          if (err) throw err;

          if (results.length === 0) {
            return Res.status(404).json({
              error: "Doesn't exists",
            });
          } else {
            database.query(DeleteQuery, Inputs, (err: Error | null) => {
              if (err) throw err;
              Res.status(201).json({
                message: "Deleted successfully",
              });
            });
          }
        }
      )
    : database.query(DeleteQuery, Inputs, (err: Error | null) => {
        if (err) throw err;
        Res.status(201).json({
          message: "Deleted successfully",
        });
      });
}

export const Query = {
  create,
  retrieve,
  update,
  delete: deleter,
};
