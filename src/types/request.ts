import { Request } from "express";
import { Document, Types } from "mongoose";

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITenant extends Document {
  _id: Types.ObjectId;
  tenantId: string;
  password?: string;
  onboardingComplete: boolean;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  email?: string;
  tenantId: string;
  warehouseId?: string;
  role?: string;
}

export interface AuthenticatedRequest extends Request {
  id?: string;
  admin?: IAdmin;
  tenant?: ITenant;
  user?: IUser;
}
