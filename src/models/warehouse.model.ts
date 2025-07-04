import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema({}, { timestamps: true });

const Warehouse = mongoose.model("Warehouse", warehouseSchema);

export default Warehouse;
