import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userId : { type: String, require: true },
    userName: { type: String, require: true},
    password: { type: String, require: true},
    name: { type: String, require: true},
    email: { type: String, require: true}
});

const User = mongoose.model("User", userSchema);
export default User;