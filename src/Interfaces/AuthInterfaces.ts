import { RowDataPacket } from "mysql2";

export interface Admin extends RowDataPacket {
  Firstname: string;
  Lastname: string;
  Email: string;
  Password: string;
  Designation: string;
  Phone_No: number;
  Location: string;
}

export interface User extends RowDataPacket {
  Firstname: string;
  Lastname: string;
  Email: string;
  Password: string;
  Phone_No: number;
  Location: string;
  Photo?: string;
}
export interface Employee extends RowDataPacket {
  Firstname: string;
  Lastname: string;
  Email: string;
  Password: string;
  Designation: string;
  Phone_No: number;
  Location: string;
  Employer: string;
  Photo?: string;
}

export interface Employer extends RowDataPacket {
  Firstname: string;
  Lastname: string;
  Email: string;
  Phone_No: number;
  Photo?: string;
}
