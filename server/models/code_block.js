const mongoose = require('mongoose');

// Create a schema (and specify to which collection it should belong)
// of a document that describes a code block
const code_block_schema = new mongoose.Schema({
  _id: String,
  title: String,
  code: String,
  solution: String,
}, {collection:'codeblocks'});

// The 'tool' with which we actually create documents of type 'code_block_schema'
// is the mongoose's model object 
const code_block = mongoose.model('', code_block_schema);

module.exports = code_block;



