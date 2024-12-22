import moment from "moment";

import { database } from "../Connections/Connect";
import { SalesParameterTypes } from "../Types/MethodTypes";
import { SalesInterface } from "../Interfaces/DatabaseInterfaces";

export const ProcessSales = (
  sale: SalesInterface,
  parameters: SalesParameterTypes,
  callback: (err?: Error) => void
) => {
  const { User_ID, Quantity, SalePrice, Product_ID } = sale;
  const { res, CheckQuery, DeleteQuery, CreateQuery, UpdateQuery, Status } =
    parameters;

  const Bought_By = User_ID;
  const Date_Created = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");

  const Price = SalePrice * Quantity;

  const Sales = [Product_ID, Quantity, Price, Date_Created, Bought_By, Status];

  database.query<SalesInterface[]>(
    CheckQuery,
    [Product_ID],
    (err: Error | null, results) => {
      if (err) {
        return callback();
      }

      console.log(results[0].Unit);

      if (results.length < 1 || results[0].Unit < Quantity) {
        return res.status(400).json({ error: "Out Of Stock" });
      } else {
        database.query(CreateQuery, Sales, (err: Error | null) => {
          if (err) {
            return callback();
          }

          const units = results[0].Unit - Quantity;
          const status =
            units < results[0].LowStockThreshold
              ? "Low Stock"
              : units === 0
              ? "Out Of Stock"
              : "In Stock";

          database.query(UpdateQuery, [units, status, Product_ID], (err) => {
            if (err) {
              return callback();
            } else {
              database.query(DeleteQuery, [Product_ID, User_ID], (err) => {
                if (err) {
                  console.log({ error: err });
                  return callback();
                } else {
                  callback();
                }
              });
            }
          });
        });
      }
    }
  );
};


