import { Response, NextFunction } from "express";

import { Warehouse } from "@/models";
import { AuthenticatedRequest } from "@/types/request";
import { AppError } from "@/utils/app-error";
import { nanoid } from "@/utils/nanoid";
import { isMongoError } from "@/utils/type-guard";

export const createWarehouse = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError("Missing authenticated user", 401);

    const tenantId = req.user.tenantId;
    const { name, location, alias } = req.body;

    if (!alias) throw new AppError("Alias is required", 400);

    const warehouseId = `WH-${nanoid()}`;
    const warehouse = await Warehouse.create({
      tenantId,
      warehouseId,
      name,
      location,
      alias,
    });
    res.status(201).json({ success: true, data: warehouse });
  } catch (err) {
    if (isMongoError(err) && err.code === 11000) {
      return next(new AppError("Email already exists", 409));
    }
    next(err);
  }
};

export const getWarehouses = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError("Missing authenticated user", 401);
    const tenantId = req.user.tenantId;
    const warehouses = await Warehouse.find({ tenantId });
    res.json({ success: true, data: warehouses });
  } catch (err) {
    next(err);
  }
};

export const getWarehouse = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { warehouseId } = req.params;

    if (!req.user) throw new AppError("Missing authenticated user", 401);
    const tenantId = req.user.tenantId;

    const warehouse = await Warehouse.findOne({ tenantId, warehouseId });
    if (!warehouse) throw new AppError("Warehouse not found", 404);
    res.json({ success: true, data: warehouse });
  } catch (err) {
    next(err);
  }
};

export const updateWarehouse = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { warehouseId } = req.params;

    if (!req.user) throw new AppError("Missing authenticated user", 401);
    const tenantId = req.user.tenantId;

    const updated = await Warehouse.findOneAndUpdate(
      { tenantId, warehouseId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) throw new AppError("Warehouse not found", 404);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteWarehouse = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { warehouseId } = req.params;

    if (!req.user) throw new AppError("Missing authenticated user", 401);
    const tenantId = req.user.tenantId;

    const deleted = await Warehouse.findOneAndDelete({ tenantId, warehouseId });
    if (!deleted) throw new AppError("Warehouse not found", 404);
    res.json({ success: true, message: "Warehouse deleted" });
  } catch (err) {
    next(err);
  }
};
