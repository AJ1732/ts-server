import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    warehouseId: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["manager", "staff"], required: true },
  },
  { timestamps: true }
);

userSchema.index({ tenantId: 1, email: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

export default User;
