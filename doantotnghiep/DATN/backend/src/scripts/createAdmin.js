import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/user.model.js'; 

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Đã kết nối MongoDB để tạo tài khoản...");

    const email = "nguyenmanhtuantuan58@gmail.com";
    const password = "manhtuan2011";

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Tài khoản này đã tồn tại rồi!");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: "Nguyễn Mạnh Tuấn", // Thêm trường name theo yêu cầu của Schema
      email,
      password: hashedPassword,
      role: "admin",
      isVerified: true
    });

    await newUser.save();
    console.log("Tạo tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.");
    process.exit(0);
  } catch (error) {
    console.error("Lỗi khi tạo tài khoản:", error);
    process.exit(1);
  }
}

createAdmin();