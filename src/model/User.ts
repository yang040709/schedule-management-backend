import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export interface IUser extends Document {
  userId: string;
  username: string;
  role: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  matchPassword: (password: string) => Promise<boolean>;
}

const generateUserId = () => {
  return `user_${nanoid(16)}`;
};

const userSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      unique: true,
      default: generateUserId,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export default model<IUser>("User", userSchema);
