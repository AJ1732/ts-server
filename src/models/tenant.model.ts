import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({}, { timestamps: true });

const Tenant = mongoose.model("Tenant", tenantSchema);

export default Tenant;
