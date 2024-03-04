"use server";

import User from "../models/user";
import Device from "../models/device";
import { connectToDb } from "../mongoose";
import { hashPassword } from "../functions";
import { VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, validate } from "../validation";
import { revalidatePath } from "next/cache";

export async function signup(name, email, username, password) {
  try {
    await connectToDb();

    if (!email || !name || !username || !password) {
      return { message: "Invalid inputs." };
    }

    const isNameValid = validate(name, [VALIDATOR_MINLENGTH(3)]);
    const isEmailValid = validate(email, [VALIDATOR_EMAIL()]);
    const isUsernameValid = validate(username, [VALIDATOR_MINLENGTH(3)]);
    const isPasswordValid = validate(password, [VALIDATOR_MINLENGTH(8)]);

    if (!isEmailValid || !isUsernameValid || !isNameValid || !isPasswordValid) {
      return { message: "Please enter valid credentials." };
    }

    const existingEmail = await User.findOne({ email: email });
    const existingUsername = await User.findOne({ name: name });

    if (existingEmail || existingUsername) {
      return { message: "User already exists. Please try again." };
    }
    const hashedPassword = await hashPassword(password);

    await User.create({
      name,
      email,
      username,
      password: hashedPassword,
    });

    return { message: "User created." };
  } catch (error) {
    console.log(error);
  }
}

export async function fetchUser(userId) {
  try {
    await connectToDb();

    const user = await User.findById(userId)
      .populate({ path: "devices", model: Device })
      .select("-password");

    if (!user) {
      return { message: "No user found." };
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.log(error);
  }
}

export async function createDevices(
  userId,
  naziv_uredjaja,
  model_uredjaja,
  potrosnja_energije
) {
  try {
    await connectToDb();

    const user = await User.findById(userId);

    if (!user) {
      return { message: "No user found." };
    }

    const newDevice = await Device.create({
      naziv_uredjaja,
      model_uredjaja,
      potrosnja_energije,
      userId: userId,
    });

    await newDevice.save();

    user.devices.push(newDevice._id);
    await user.save();

    revalidatePath("/");

    return { message: "Success." };
  } catch (error) {
    console.log(error);
  }
}

export async function deleteDevices(userId, deviceId) {
  try {
    await connectToDb();

    const user = await User.findById(userId);
    const device = await Device.findById(deviceId);

    if (!user || !device) {
      return { message: "No user or device found." };
    }

    await Device.findByIdAndDelete(deviceId);

    await User.findByIdAndUpdate(userId, {
      $pull: {
        devices: deviceId,
      },
    });

    revalidatePath("/");

    return { message: "Success." };
  } catch (error) {
    console.log(error);
  }
}
