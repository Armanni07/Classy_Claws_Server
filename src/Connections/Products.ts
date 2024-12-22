import moment from "moment";
import { Request, Response } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";

import { Query } from "../Functions/CRUD";
import {
  DeleteProps,
  ProductsInterface,
} from "../Interfaces/DatabaseInterfaces";

const SECRET_KEY = process.env.SECRET_KEY as string;
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY as string;

export const CreateProduct = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;

  const CheckQuery: string = `SELECT * FROM Products WHERE Name = ?`;
  const CreateQuery: string = `
  INSERT INTO Products(Name, Description, Serial_Code, BarCode, MeasurementMethod, Unit, LowStockThreshold, Status, CostPrice, SalePrice, Image, Category_Id, Created_By, Updated_By, Date_Created, Date_Updated, Discount_Id) 
  VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

  const {
    Name,
    Description,
    SerialCode,
    Barcode,
    MeasurementMethod,
    Unit,
    LowStockThreshold,
    SalePrice,
    CostPrice,
    Image,
    CategoryId,
    DiscountId,
  } = req.body;

  const Date_Created = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
  const Date_Updated = null;

  // const ImageBlob = Buffer.from(Image, "base64");

  jwt.verify(
    token,
    ADMIN_SECRET_KEY,
    (error: JsonWebTokenError | null, user: any) => {
      if (error) {
        console.log("Forbidden", error);
        return res.status(403).json({ error: "Forbidden" });
      }

      const Status: string =
        Unit > LowStockThreshold
          ? "In Stock"
          : 0 < Unit && Unit >= LowStockThreshold
          ? "Low Stock"
          : "Out Of Stock";

      const Created_By: number = user.userId.id;
      const Updated_By = null;

      const Products = [
        Name,
        Description,
        SerialCode,
        Barcode,
        MeasurementMethod,
        Unit,
        LowStockThreshold,
        Status,
        SalePrice,
        CostPrice,
        Image,
        CategoryId,
        Created_By,
        Updated_By,
        Date_Created,
        Date_Updated,
        DiscountId,
      ];

      Query.create<ProductsInterface>({
        Res: res,
        Inputs: Products,
        CheckInput: Name,
        CheckQuery: CheckQuery,
        CreateQuery: CreateQuery,
      });
    }
  );
};

export const CreateIdProduct = (req: Request, res: Response) => {
  const token = req.cookies.employeeToken;

  const CheckQuery: string = `SELECT * FROM Products WHERE Name = ?`;
  const CreateQuery: string = `INSERT INTO Products(Name, Description, SerialCode, Barcode, MeasurementMethod, Unit, LowStockThreshold, SalePrice, CostPrice, Image, CategoryId, Created_By, Updated_By, Date_Created, Date_Updated, DiscountId) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

  const {
    Name,
    Description,
    SerialCode,
    Barcode,
    MeasurementMethod,
    Unit,
    LowStockThreshold,
    SalePrice,
    CostPrice,
    Image,
    CategoryId,
    DiscountId,
  } = req.body;

  const Date_Created = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
  const Date_Updated = null;

  const Created_By: number = req.body.id;
  const Updated_By: number = 0;

  const Products = [
    Name,
    Description,
    SerialCode,
    Barcode,
    MeasurementMethod,
    Unit,
    LowStockThreshold,
    SalePrice,
    CostPrice,
    Image,
    CategoryId,
    Created_By,
    Updated_By,
    Date_Created,
    Date_Updated,
    DiscountId,
  ];

  jwt.verify(
    token,
    SECRET_KEY,
    (error: JsonWebTokenError | null, user: any) => {
      if (error) {
        console.log("Forbidden", error);
        return res.status(403).json({ error: "Forbidden" });
      }

      Query.create<ProductsInterface>({
        Res: res,
        Inputs: Products,
        CheckInput: Name,
        CheckQuery: CheckQuery,
        CreateQuery: CreateQuery,
      });
    }
  );
};

export const RetrieveProducts = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;
  const RetrieveQuery: string = token
    ? `SELECT * FROM Products`
    : `SELECT * FROM Products WHERE Unit > 0`;

  Query.retrieve({ Res: res, RetrieveQuery: RetrieveQuery });
};
export const SearchProducts = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;
  const RetrieveQuery: string = token
    ? `SELECT * FROM Products WHERE  Name LIKE ?`
    : `SELECT * FROM Products 
       WHERE Unit > 0 
       AND Name LIKE ?`;

  const Name = req.params.id;
  const Inputs = [`%${Name}%`];
  console.log(Inputs);

  Query.retrieve({ Res: res, Inputs, RetrieveQuery: RetrieveQuery });
};

export const RetrieveIdProducts = (req: Request, res: Response) => {
  const id = req.params.id;

  const RetrieveQuery: string = `
SELECT 
    p.*,
    JSON_OBJECT(
        'id', s.id,
        'Designation', s.Designation,
        'Email', s.Email
    ) AS Staff,
    JSON_OBJECT(
        'Name', c.Name,
        'Description', c.Description
    ) AS Category
FROM 
    Products AS p
JOIN 
    Staff AS s ON (p.Created_By = s.id OR p.Updated_By = s.id) 
JOIN 
    Categories AS c ON (p.Category_Id = c.id) 
WHERE 
    p.id = ?;
`;

  if (id) {
    Query.retrieve({ Res: res, Inputs: id, RetrieveQuery: RetrieveQuery });
  }
};

export const UpdateProduct = (req: Request, res: Response) => {
  const id = req.params.id;
  const token = req.cookies.adminToken;

  const CheckQuery: string = `SELECT * FROM Products WHERE id = ?`;
  const UpdateQuery: string = `
    UPDATE Products 
    SET Name = ?, 
        Description = ?,
        Serial_Code = ?,
        BarCode = ?,
        MeasurementMethod = ?,
        Unit = ?,
        LowStockThreshold = ?,
        Status = ?,
        CostPrice = ?,
        SalePrice = ?,
        Image = ?,
        Category_Id = ?,
        Created_By = ?,
        Updated_By = ?,
        Date_Created = ?,
        Date_Updated = ?,
        Discount_Id = ? 
    WHERE id = ?`;

  const {
    Name,
    Description,
    Serial_Code,
    BarCode,
    MeasurementMethod,
    Unit,
    LowStockThreshold,
    CostPrice,
    SalePrice,
    Image,
    CategoryId,
    Created_By,
    Date_Created,
    Discount_Id,
  } = req.body;

  const Date_Updated = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
  const CreationDate = moment(Date_Created).format("YYYY-MM-DD HH:mm:ss");

  jwt.verify(
    token,
    ADMIN_SECRET_KEY,
    (error: JsonWebTokenError | null, user: any) => {
      if (error) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const Updated_By: number = user.userId.id;

      const Products = [
        Name,
        Description,
        Serial_Code,
        BarCode,
        MeasurementMethod,
        Unit,
        LowStockThreshold,
        CostPrice,
        SalePrice,
        Image,
        CategoryId,
        Created_By,
        Updated_By,
        CreationDate,
        Date_Updated,
        Discount_Id,
        id,
      ];

      Query.update<ProductsInterface>({
        Res: res,
        Inputs: Products,
        CheckInput: id,
        CheckQuery: CheckQuery,
        UpdateQuery: UpdateQuery,
      });
    }
  );
};

export const DeleteProduct = (req: Request, res: Response) => {
  const CheckQuery: string = `SELECT * FROM Products WHERE id = ?`;
  const DeleteQuery: string = `DELETE FROM Products WHERE id = ?`;

  const productId = req.params.id;
  const Products = [productId];

  Query.delete<DeleteProps>({
    Res: res,
    Inputs: Products,
    CheckQuery: CheckQuery,
    DeleteQuery: DeleteQuery,
  });
};

export const ProductsChart = (req: Request, res: Response) => {
  const token = req.cookies.adminToken;

  const RetrieveQuery: string = `
  SELECT 
  p.Name, p.SalePrice, p.Unit, p.MeasurementMethod, 
  COUNT(s.id ) AS sold,
  COUNT(d.id) AS damaged
  FROM Products as p
  LEFT JOIN Sales as s ON (p.id = s.Product_ID)
  LEFT JOIN Damaged_Items as d ON (p.id = d.Product_ID)
  GROUP BY p.id
  `;

  jwt.verify(
    token,
    ADMIN_SECRET_KEY,
    (err: JsonWebTokenError | null, user: any) => {
      if (err || !user) {
        return res.status(403).json({ error: "Forbidden" });
      }

      Query.retrieve({ Res: res, RetrieveQuery: RetrieveQuery });
    }
  );
};
