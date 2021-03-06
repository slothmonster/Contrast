'use strict';
var userService = require('../services/userService');
var Promise = require('bluebird');

module.exports = {

  login:function(req, res){
    //look up user
    //check password
    //set session id
    //set session.authenticated = true
    //set sessions
    var email = req.body.email;
    userService.fetchUserByEmail(email)
    .then(function(nodes){
      if(nodes.length>0){
        return nodes[0];
      } else {
        throw new Error('no user exists the given username/password');
      }
    })
    .then(function(node){
      return Promise.all([userService.validatePassword(req.body.password, node.password), node]);
    })
    .spread(function(isValid, node){
      if(isValid){
        delete node.password;
        req.session.user = node;
        req.session.user.id = node._id;
        req.session.authenticated = true;
        if(!!req.wantsJSON){
          res.send({
            success: true,
            data: node
          });
        } else {
          res.redirect('/');
        }
      } else {
        if(!!req.wantsJSON){
          res.send({
            success: false,
            reason: 'Username or Password is incorrect'
          });
        } else {
          res.redirect('/login');
        }
      }
    })
    .catch(function(){
      res.send({
        success: false,
        reason: 'Username or Password is incorrect'
      });
    });
  },

  isLoggedIn: function(req,res){
    if(req.session.authenticated){
      res.send({
        success:true,
        data: req.session.user
      });
    }else{
      res.send({
        success:false
      });
    }
  },

  logout:function(req,res){
    var userId = req.session.user.id || req.session.user._id;
    req.session.user = null;
    req.session.authenticated = false;
    if(!!req.wantsJSON){
      req.socket.broadcast.emit('/user/' + userId, {
        updatedAt: new Date()
      });
      res.send({
        success: true
      });
    } else {
      res.redirect('/login');
    }
  },

  signup:function(req,res){
    //get userData from req
    //userService.createUser
    //if success, res.send(node)
    //else return error
    var userData = req.body;
    delete userData.json;
    userService.createUser(userData)
    .then(function(node){
      delete node.password;
      req.session.user = node;
      req.session.user.id = node._id;
      req.session.user.name = node.username;
      req.session.authenticated = true;
      if(!!req.wantsJSON){
        res.send({
          success: true,
          data: node
        });
      } else {
        res.redirect('/');
      }
    })
    .catch(function(err){
      console.log('error creating user: ' + err);
      res.send({
        success: false,
        reason: err.toString().replace('Error: ','')
      });
    });
  },

  removeAcct: function(req, res){
    //TODO: after the deleteUser function is fixed to delete relationships, hook this up

    // var userId = req.session.user.id;
    // userService.deleteUser(userId)
    // .then(function(success){
    //   if(success){
    //     res.send("user deleted successfully");
    //   } else {
    //     res.send(400, "user was not deleted");
    //   }
    // })
    // .catch(function(err){
    //   console.log("error deleting user: " + err);
    // });

  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to AuthController)
   */
  _config: {}


};

// var testReq = {
//   params: {email: 'encrypt@gmail.com', password: "adam"}
// };
// var testRes = {};
// module.exports.login(testReq, testRes);
