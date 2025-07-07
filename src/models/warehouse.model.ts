import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    warehouseId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    alias: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

warehouseSchema.index({ tenantId: 1, alias: 1 }, { unique: true });
warehouseSchema.index({ tenantId: 1, warehouseId: 1 }, { unique: true });

const Warehouse = mongoose.model("Warehouse", warehouseSchema);

export default Warehouse;
