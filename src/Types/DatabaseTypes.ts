export type ProductsType = {
  Name: string;
  Description: string;
  SerialCode: string;
  Barcode: string;
  MeasurementMethod: string;
  Unit: number;
  LowStockThreshold: number;
  SalePrice: number;
  CostPrice: number;
  ImageUrl: string;
  CategoryId: string;
  Created_By: number;
  Updated_By?: number;
  Date_Created: Date;
  Date_Updated?: Date;
  DiscountId?: string;
};

export type CategoriesType = {
  Name: string;
  Description: string;
  Created_By: number;
  Updated_By?: number;
  Date_Created: Date;
  Date_Updated?: Date;
};

export type DamagedItemsType = {
  ProductId:number;
  Quantity:number;
  Description:string;
  Created_By:number
  Updated_By:number
  Date_Created:Date;
  Date_Updated:Date;
};

export type SalesType={
  
}