import { Response } from "express";

export type SalesParameterTypes = {
  res: Response;
  Status: string;
  CheckQuery: string;
  DeleteQuery: string;
  CreateQuery: string;
  UpdateQuery: string;
};
