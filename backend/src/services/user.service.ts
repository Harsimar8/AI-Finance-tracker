import UserModel from "../models/user.model";
import { NotFoundException } from "../utils/app-error";
import mongoose from "mongoose";

export const findByIdUserService = async (userId: string) =>{
    const user = await UserModel.findById(new mongoose.Types.ObjectId(userId));
    return user?.omitPassword();
};


export const updateuserService = async (
    userId: string,
    body: UpdateUserType,
    profilePic?: Express.Multer.File 
) => {
    const user = await UserModel.findById(new mongoose.Types.ObjectId(userId));
    if(!user) throw new NotFoundException("User not found");

    if(profilePic){
        user.profilePicture = profilePic.path;
    }

    if (body.name) {
        user.name = body.name;
    }

    if (body.preferredCurrency) {
        user.preferredCurrency = body.preferredCurrency;
    }

    await user.save();

    return user.omitPassword();
}