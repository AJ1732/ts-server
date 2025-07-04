import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({}, { timestamps: true });

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;
