const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuoteSchema = new Schema({
    theme:{
        type: String,
        required : true,
    },
    quote:{
     type : String,
     required : true,
    },
    writer:{
        type : String,
        required : true
    },
    imageUrl:{
        type: String,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    }
})

module.exports = mongoose.model('quote', QuoteSchema);