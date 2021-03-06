'use strict';
var challengeService = require('../services/challengeService');


var serveError = function(res){
  return function(err){
    res.send({
      success: false,
      reason: err
    });
  };
};

var serveData = function(res){
  return function(data){
    res.send({
      success: true,
      data: data
    });
  };
};

module.exports = {
  /**
   * Action blueprints:
   *    `/challenge/image`
   */

  createChallenge:function(req,res){
    var challengerImageId = req.body.challengerImageId;
    var opponentImageId = req.body.opponentImageId;

    if(!challengerImageId || !opponentImageId){
      return serveError(res)("Challenger and Opponent IDs are needed.");
    }

    console.log('challenge:', challengerImageId, opponentImageId);

    challengeService.createChallenge(challengerImageId, opponentImageId, {})
    // .then(function(challenge){
    //   sails.io.sockets.emit('challenge', {
    //     data: challenge,
    //     verb: 'create',
    //     id: challenge._is,
    //     createdAt: challenge.createdAt,
    //     updatedAt: new Date()
    //   })
    //   return challenge;
    // })
    .then(serveData(res))
    .catch(serveError(res));
  },

  acceptChallenge:function(req,res){
    var userId = req.session.user.id;
    var challengeId = req.body.challengeId;
    if(!challengeId){
      return serveError(res)("Challenge ID is needed.");
    }

    challengeService.acceptChallenge(userId, challengeId, {})
    .then(serveData(res))
    .catch(serveError(res));

  },

  rejectChallenge:function(req,res){
    var userId = req.session.user.id;
    var challengeId = req.body.challengeId;
    if(!challengeId){
      return serveError(res)("Challenge ID is needed.");
    }
    challengeService.rejectChallenge(userId, challengeId, {})
    .then(serveData(res))
    .then(function(){
      userService.removePoints(userId, 5);
    })
    .catch(serveError(res));
  },

  myChallenges: function (req, res) {
    var userId = req.session.user.id || req.session.user._id;
    var relationship = req.body.relationship;

    challengeService.findChallengesByUserHistory(userId, relationship)
    .then(serveData(res))
    .catch(serveError(res));
  },


   //should return empty array if there are no challenges unconnected to user.id above, else should
   //return array of challenges
  serveChallenge:function(req,res){
    //look at cookies to serve next correct challenge

    var userId = req.session.user.id || req.session.user._id;

    challengeService.findChallengesToVoteOn(parseInt(userId))
    .then(serveData(res))
    .catch(serveError(res));
  },

  acceptReject:function(req,res){
    var userId = req.session.user.id || req.session.user._id;
    console.log(userId);

    challengeService.findChallengesToBeAcceptedRejected(parseInt(userId))
    .then(serveData(res))
    .catch(serveError(res));
  },

  castVote:function(req,res){

    var userId = req.session.user.id || req.session.user._id;
    var challengeId = req.body.challengeId;
    var imageId = req.body.imageId;
    if(!challengeId || !imageId){
      return serveError(res)("Challenge and Image IDs is needed.");
    }

    challengeService.addUserVote(userId, challengeId, imageId)
    .then(serveData(res))
    .then(function(){
      userService.addPoints(userId, 1);
    })
    .catch(serveError(res));

  },

  // endChallenge: function(req, res){
  //   var challengeId = req.body.challengeId;

  //   challengeService.endChallenge(challengeId)
  //   .then()
  //   // .then(function(){
  //   //   userService.addPoints(userId, 1);
  //   // })
  //   .catch(serveError(res));
  // },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ChallengeController)
   */
  _config: {}
};
