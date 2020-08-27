//jshint esversion:8

const mongoose = require('mongoose'); //DB

module.exports = {

  userSchema: function() {

    var userSchema = new mongoose.Schema({
      firstname: {
        type: String,
        default: '',
        validate: function(firstname) {
          return /^[A-Za-z]+$/.test(firstname);
        },
        validationLevel: "strict",
        validationAction: "error"
      },
      surname: {
        type: String,
        default: '',
        validate: function(surname) {
          return /^[A-Za-z]+$/.test(surname);
        },
        validationLevel: "strict",
        validationAction: "error"
      },
      username: {
        type: String,
        unique: true,
        lowercase: true,
        validate: function(username) {
          return /^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(username);
        },
        validationLevel: "strict",
        validationAction: "error"
      },
      tf_use: {
        type: String,
        default: ''
      },
      tf_cd: {
        type: String,
        default: ''
      },
      lodging:{
        recent:{
          type: String,
          default: ''
        },
        current:{
          type: String,
          default: ''
        }
      }
    });
    return userSchema;
  },

  clientSchema: function() {

    var clientSchema = new mongoose.Schema({
      client: {
        type: String,
        default: ''
      },
      dept: {
        type: String,
        default: ''
      },
      contact: {
        name: {
          type: String,
          default: '',
        },
        email: {
          type: String,
          default: '',
          unique: true,
          lowercase: true,
          validate: function(email) {
            return /^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
          },
          validationLevel: "strict",
          validationAction: "error"
        },
        phone: {
          type: Number,
          default: '',
          validate: function(phone) {
            return /^[0-9]+$/.test(phone);
          },
          validationLevel: "strict",
          validationAction: "error"
        }
      }
    });
    return clientSchema;
  },

  chunkSchema: function() {

    var chunkSchema = new mongoose.Schema({
      code: {
        type: String,
        default: '',
        unique: true
      },
      name: {
        type: String,
        default: ''
      },
      description: {
        type: String,
        default: ''
      },
      timeLimit: {
        minutes: {
          type: Number,
          default: '60'
        },
        seconds: {
          type: Number,
          default: '0'
        }
      }
    });
        return chunkSchema;
  },

    commissionSchema: function() {

      var commissionSchema = new mongoose.Schema({
        user: {
          type: String,
          default: ''
        },
        name:{
          type: String,
          default: ''
        },
        client: {
          type: String,
          default: ''
        },
        deadline:{
          type: Date,
          default: Date.now
        },
        commissions: []
      });

    return commissionSchema;
  },

  regSchema: function() {

    var regSchema = new mongoose.Schema({
        uName:{
          type: String,
          default: ''
        },
        rStr: {
          type:String,
          default: ''
        },
        lStr:{
          type:String,
          default: ''
        },
        pDat: {
          type: Date,
          default: Date.now
        }
    });

    return regSchema;
  }
};
