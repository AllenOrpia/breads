
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const communitySchema = new Schema({
    id : {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    image: String,
    bio: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    threads: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Thread'
        }
    ],
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            
        }
    ]
})

const Community = mongoose.models.Schema || mongoose.model('Schema', communitySchema);

export default Community