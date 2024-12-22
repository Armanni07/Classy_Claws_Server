import { RowDataPacket } from "mysql2";

export interface CartInterface extends RowDataPacket {
  Product_ID: number;
  Quantity: number;
  User_ID: number;
}

export interface MailInterface extends RowDataPacket {
  Messages: string;
  User_ID: number;
  Date: Date;
}

export interface ProductsInterface extends RowDataPacket {
  Name: string;
  Description: string;
  SerialCode: string;
  Barcode: string;
  MeasurementMethod: string;
  Unit: number;
  LowStockThreshold: number;
  Status: number;
  SalePrice: number;
  CostPrice: number;
  Image: string;
  CategoryId: string;
  Created_By: number;
  Updated_By?: number;
  Date_Created: Date;
  Date_Updated?: Date;
  DiscountId?: string;
}

export interface CategoriesInterface extends RowDataPacket {
  Name: string;
  Description: string;
  Created_By: number;
  Updated_By?: number;
  Date_Created: Date;
  Date_Updated?: Date;
}

export interface DamagedItemsInterface extends RowDataPacket {
  ProductId: number;
  Quantity: number;
  Description: string;
  Created_By: number;
  Updated_By?: number;
  Date_Created: Date;
  Date_Updated?: Date;
}

export interface SalesInterface extends RowDataPacket {
  Price: number;
  User_ID: number;
  Unit: number;
  Product_ID: number;
  Sales_Date: string;
}

export interface DeleteProps extends RowDataPacket {
  affected_rows: number;
}
