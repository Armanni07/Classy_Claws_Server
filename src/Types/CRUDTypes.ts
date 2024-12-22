import { Request, Response } from "express";

import {
  ProductsType,
  CategoriesType,
  DamagedItemsType,
} from "../Types/DatabaseTypes";

export type CreateType = {
  Res: Response;
  Inputs: ProductsType | CategoriesType | DamagedItemsType | any;
  CheckInput: string;
  CheckQuery: string;
  CreateQuery: string;
};

export type RetrieveType = {
  Res: Response;
  Inputs?: any;
  RetrieveQuery: string;
};

export type UpdateType = {
  Res: Response;
  Inputs: ProductsType | CategoriesType | DamagedItemsType | any;
  CheckInput: string | number;
  CheckQuery: string;
  UpdateQuery: string;
};

export type DeleteType = {
  Res: Response;
  Inputs: ProductsType | CategoriesType | DamagedItemsType | any;
  CheckQuery?: string;
  DeleteQuery: string;
};
