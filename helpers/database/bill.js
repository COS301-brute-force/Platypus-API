var mongoose	= require('mongoose');
var Bills 		= require('../../models/bills');
var Users 		= require('../../models/users');
var Claims 		= require('../../models/claims');
var Items 		= require('../../models/items');
var dbutils		= require('./dbutils');
var MTypes		= mongoose.Types;
var debug			= require('debug')('platypus-api:helpers:bill');

/**
 * Function that receives the user data (Nickname and profile color) entered
 * when a user requests a new session. A new user is created. A new bill and
 * session are also created. The new user is then added to the bill.
 * @param {request} req req used by Express.js to fetch data from the client.
 * @param {response} res res used by Express.js to send responses back to the
 *                       client.
 * @param {object} next
 * @return JSON object containing session ID and user ID
 */
module.exports.createSession = function () {
	return new Promise(function (resolve, reject) {
		debug("Running Bill.Create Session");
		var b_id = dbutils.generateBillID();
		var user_added = "";

		var bill = new Bills({
			_id: new MTypes.ObjectId(),
			bill_id: b_id,
			bill_image: "",
			users_count: 0,
			items_count: 0,
			users: [],
			bill_items: [],
			bill_total: 0,
			bill_unclaimed_total: 0,
			bill_owner: ""
		});

		bill.save(function (err) {
			if (err) {
				debug(err);
			}
				resolve (b_id);
		});
	});
}

/**
 * This function is called to add a new user to the database for the current
 * bill session.
 * @param {bill_id} session_id This is the unique session ID to find the correct
 *                             Session to add the user to.
 * @param {String} nname This is the name of the new user.
 * @param {String} ucolor The color selected by the user
 */
module.exports.addUserToDB = function(session_id, nname, ucolor) {
	return new Promise(function (resolve, reject) {
		var finalid = null;
		Bills.findOne({ bill_id: session_id },
			function (err, doc) {
				if (err || doc === null) {
					console.log("Bill not found!");
					// TODO: Fix error handling
					return 0;
				}

				var bill_session = doc;
				var user_count = bill_session.users_count;
				var nickname = nname;
				var user_color = ucolor;
				var user_id = session_id + dbutils.getUserId(user_count);
				var user_owner = (user_count == 0);

				debug(user_count);
				debug("Adding user: uid = " + user_id + ", uOwner = " + user_owner + ", uNickname = " + nickname + ", uColor = " + user_color);

				var user = new Users({
					_id: new MTypes.ObjectId(),
					u_id: user_id,
					u_owner: Boolean,
					u_nickname: nickname,
					u_color: user_color
				});

				bill_session.users.push(user);
				var subdoc = bill_session.users[user_count];
				subdoc.isNew;
				bill_session.users_count = user_count + 1;
				if(user_owner){
					bill_session.bill_owner = user_id;
				}

				bill_session.save(function (err) {
					if (err) return handleError(err);
					user.save(function (err) {
						if (err) return handleError(err);
					});
				});
				debug("Added obj: " + bill_session.users[user_count - 1]);
				resolve(user_id);
			}
		);
	});
}

module.exports.removeUserFromDB = function(user_id, session_id) {
	debug("removing user " + user_id + " from session " + session_id);
	return new Promise(function (resolve) {
		var isRemoved = false;
		Bills.findOne({
			bill_id: session_id
		}, function (err, doc) {
			if (err || doc === null) {
				console.log("Bill not found!");
				// TODO: Fix error handling
				return 0;
			}

			var bill_session = doc;
			var user_count = bill_session.users_count;

			//@TODO: confirm that the following line removes the user from the DB
			bill_session.users.update({u_id: user_id}, {$unset: {field: 1}});
			isRemoved = true;
			resolve(isRemoved);
		})
	});
}

module.exports.isSessionEmpty = function (session_id) {
	return new promise(function (resolve) {
		Bills.findOne({
			bill_id: session_id
		}, function (err, doc) {
			var isEmpty;
			var bill_session = doc;
			var user_count = bill_session.users_count;
			if(user_count == 0) {
				isEmpty = true;
			}
			else {
				isEmpty = false;
			}
			resolve(isEmpty);
		});
	});
}

module.exports.populateItems = function(items, session_id, image) {
	return new Promise(function (resolve, reject) {
		Bills.findOne({
			bill_id: session_id
		}, function (err, doc) {
			var totalCalc = parseFloat(0);
			items.forEach(function (iter) {
				debug("Loop runs");
				debug(iter);
				var itid = session_id + dbutils.getItemId(doc.items_count);
				var item = new Items({
					_id: new MTypes.ObjectId(),
					i_id: itid,
					i_name: iter.desc,
					i_quantity: parseInt(iter.quantity),
					i_price: parseFloat(iter.price)
				});
				doc.bill_items.push(item);
				var subdoc = doc.bill_items[doc.bill_items.length-1];
				subdoc.isNew;
				doc.items_count += 1;
				totalCalc += (item.i_price * parseFloat(item.i_quantity));
				debug("What total should be: ");
				debug((item.i_price * parseFloat(item.i_quantity)));
				debug("TOTAL: ");
				debug(totalCalc);
				item.save(function (err) {
					if (err){
						debug("Item Error: ");
						debug(err);
						return handleError(err);
					}
				});
			});
			doc.bill_total = totalCalc;
			doc.bill_unclaimed_total = totalCalc;
			doc.bill_image = image;
			doc.save(function (err) {
				if (err){
					debug("Bill Error: ");
					debug(err);
					return handleError(err);
				}
			});
			debug("Added item: " + doc.items_count);
			debug(doc.bill_items);
			resolve(doc.bill_items);
		});
	});
}

module.exports.addItemToDB = function(session_id, price, name, quantity) {
	return new Promise(function (resolve, reject) {
		debug("SessionID" + session_id);
		Bills.findOne({
			bill_id: session_id
		}, function (err, doc) {
			if (doc != null) {
				var itid = session_id + dbutils.getItemId(doc.items_count + 1);
				var item = new Items({
					_id: new MTypes.ObjectId(),
					i_id: itid,
					i_name: name,
					i_quantity: parseInt(quantity),
					i_price: parseFloat(price)
				});
				doc.bill_items.push(item);
				debug(doc.bill_items[doc.bill_items.length-1]);
				var subdoc = doc.bill_items[doc.bill_items.length-1];
				subdoc.isNew;
				doc.items_count += 1;
				doc.bill_total += parseFloat(item.i_price * item.i_quantity);
				doc.bill_unclaimed_total += parseFloat(item.i_price * item.i_quantity);
				doc.save(function (err) {
					if (err) return handleError(err);
					item.save(function (err) {
						if (err) return handleError(err);
					});
				});
				debug("Added item: " + doc.items_count);
				var response = {
							i_response	:	item,
							new_total	 : doc.bill_total,
							bill_unclaimed_total : doc.bill_unclaimed_total
				};
				resolve(response);
			}
		});
	});
}

module.exports.claimItem = function (data) {
	return new Promise(function (resolve, reject) {
		var claimed = false;
		var userAmountPrev = 0;
		var priceOfClaim = 0;
		debug("ClaimItem: SessionID: " + data.session_id + " UserID: " + data.user_id + " ItemID: " + data.item_id);
		Users.findOne({
			u_id: data.user_id
		}).populate({
			path: 'item_claimed'
		}).exec(function (err, user) {
			for (item in user.item_claimed) {
				if (item.item_id == data.item_id) {
					userAmountPrev = item.quantity;
					item.quantity = data.quantity;
					bill.save();
					claimed = true;
				}
			}
			if (!claimed) {
				var claim = new Claims({
					_id: new MTypes.ObjectId(),
					item_id: data.item_id,
					quantity: parseInt(data.quantity)
				});
				user.item_claimed.push(claim);
				var subdoc = user.item_claimed[user.item_claimed.length - 1];
				subdoc.isNew;
				claim.save(function (err) {
					if (err) return handleError(err);
				});
				user.save();
			}
			Items.findOne({
				i_id: data.item_id
			}, function (err, item) {
				var qClaimed = 0;
				if (item) {
					if ((data.quantity - userAmountPrev) > item.i_quantity) {
						qClaimed = item.i_quantity;
						item.i_quantity = 0;
					}
					else {
						qClaimed = data.quantity - userAmountPrev;
						item.i_quantity = item.i_quantity - (data.quantity - userAmountPrev);
					}
					item.save(function (err) {
						if (err) return handleError(err);
					});
				}
				Bills.findOne({
					bill_id: data.session_id
				}, function (err, bill) {
					if (bill) {
						priceOfClaim = item.i_price * qClaimed;
						bill.bill_unclaimed_total = bill.bill_unclaimed_total - priceOfClaim;
						bill.save(function (err) {
							if (err) return handleError(err);
						});
					}
					var response = {
						u_id : data.user_id,
						i_response : item,
						u_quantity : data.quantity,
						bill_unclaimed_total : bill.bill_unclaimed_total
					};
					resolve(response);
				});
			});
		});
	});
}

module.exports.unclaimItem = function (data) {
	return new Promise(function (resolve, reject) {
		var priceOfClaim = 0;
		Items.findOne({
			i_id: data.item_id
		}, function (err, item) {
			item.i_quantity = item.i_quantity + 1;
			priceOfClaim = parseFloat(item.i_price);
			item.save(function(err){
				if (err) return handleError(err);
			});

			Bills.findOne({
				bill_id: data.session_id
			}, function (err, bill) {
				if (bill) {
					bill.bill_unclaimed_total = bill.bill_unclaimed_total + priceOfClaim;
					bill.save(function (err) {
						if (err) return handleError(err);
					});
				}
				var response = {
					i_response : item,
					bill_unclaimed_total : bill.bill_unclaimed_total
				};
				resolve(response);
			});
		});
	});
}

module.exports.editItem = function(data) {
	return new Promise(function (resolve, reject) {
		Items.findOne({
			i_id: data.item_id
		}, function(err, item){
			var oldPrice = parseFloat(item.i_price);
			var oldQuantity = parseInt(item.i_quantity);
			var claimsQuantity = parseInt(0);
			item.i_name = data.name;
			item.i_quantity = parseInt(data.quantity);
			item.i_price = parseFloat(data.price);
			debug(item.i_name + " " + item.i_quantity + " " + item.i_price);
			item.save(function (err) {
				if (err) return handleError(err);
				});
			Bills.findOne({
				bill_id: data.session_id
			}, function (err, doc) {
				Claims.findOne({item_id: data.item_id}, function(err, claim){
					if(claim) {
						claimsQuantity = parseInt(claim.quantity);
					}
					doc.bill_total -= oldPrice * (oldQuantity + claimsQuantity);
					doc.bill_total += item.i_price * (item.i_quantity + claimsQuantity);
					doc.bill_unclaimed_total -= oldPrice * oldQuantity;
					doc.bill_unclaimed_total += item.i_price * item.i_quantity;
					doc.save(function (err) {
						if (err) return handleError(err);
						item.save(function (err) {
							if (err) return handleError(err);
						});
					});
					var response = {
						i_response : item,
						new_total	 : doc.bill_total,
						bill_unclaimed_total : doc.bill_unclaimed_total
					};
					debug(response);
					resolve(response);
				});
			});
		});
	});
}

module.exports.deleteItem = function(data) {
	return new Promise(function (resolve, reject) {
		debug("deleteItem: SessionID: " + data.session_id + " ItemID: " + data.item_id);
		var itemIdToRemove = null;
		var priceToDeduct = 0;
		var claimedPriceToDeduct = 0;
		var i_idToRemove = "";
		var claimsQuantity = 0;
		var nTotal = 0;
		var nUnclaimed = 0;
		Items.findOne({
			i_id: data.item_id
		}, function(err, item){
			Claims.findOne({item_id: data.item_id}, function(err, claim){
				if(claim) {
					claimsQuantity = parseInt(claim.quantity);
				}
				debug("Found item");
				debug(item.i_id);
				itemIdToRemove = item._id;
				i_idToRemove = item.i_id;
				priceToDeduct = item.i_price * (parseInt(item.i_quantity) + parseInt(claimsQuantity));
				claimedPriceToDeduct = item.i_price * item.i_quantity;
				debug("Quantity to deduct: ");
				debug(priceToDeduct);
				Claims.find({item_id: data.item_id}).remove().exec();
				Bills.findOne({bill_id: data.session_id}, function(err, bill){
					//bill.items_count -= 1;
					bill.bill_total -= priceToDeduct;
					nTotal = bill.bill_total;
					bill.bill_unclaimed_total -= claimedPriceToDeduct;
					nUnclaimed = bill.bill_unclaimed_total;
					bill.bill_items.pull({_id: itemIdToRemove});
					bill.save(function (err) {
						if (err) return handleError(err);
					});
					Bills.update({
						bill_id: data.session_id
					}, {"$pull": {bill_items: {_id: itemIdToRemove}}}, function (err, doc) {
						debug("Added item: " + doc.i_id);
						var response = {
									i_id	:	i_idToRemove,
									new_total	 : nTotal,
									bill_unclaimed_total : nUnclaimed
								}
						resolve(response);
					});
				});
			});
		});
	});
}

module.exports.calculateTotal = function(session_id) {
	return new Promise(function(resolve) {
		Bills.findOne({
			bill_id: session_id
		}, function (err, doc) {
			doc.bill_total = 0;
			doc.bill_items.forEach(function (iter) {
				doc.bill_total += iter.i_price*iter.i_quantity;
			});
			doc.save(function (err) {
				if (err) return handleError(err);
				resolve(doc.bill_total);
			});
		});
	});
}

module.exports.calculateClaimedTotal = function(session_id) {
	return new Promise(function(resolve) {
		Bills.findOne({
			bill_id: session_id
		}, function (err, doc) {
			doc.bill_unclaimed_total = 0;
			doc.bill_items.forEach(function (billItem) {
				Claims.findOne({
					item_id : billItem.i_id
				}, function(err, claimedItem) {
					doc.bill_unclaimed_total += billItem.i_price*claimedItem.quantity;
				});
			});
			doc.save(function (err) {
				debug("Bill Save Error: ");
				debug(err);
				if (err) return handleError(err);
				resolve(doc.bill_unclaimed_total);
			});
			debug("Summed claims prices: " + doc.bill_unclaimed_total);
		});
	});
}

module.exports.calculateUnclaimedTotal = function(session_id) {
	var total = calculateUnclaimedTotal(session_id);
	var claimed = calculateTotal(session_id);
	var unclaimed = total - claimed;
	Bills.findOne({
		bill_id: session_id
	}, function (err, doc) {
		doc.bill_total_unclaimed = unclaimed;
		doc.save(function (err) {
			debug("Bill save error: ");
			debug(err);
			if (err) return handleError(err);
			resolve(doc.bill_total_unclaimed);
		});
		debug("Calculated and stored unclaimed total: " + doc.bill_total_unclaimed);
	});
}

module.exports.fetchBillData = function(session_id) {
	return new Promise(function (resolve) {
		Bills.findOne({
			bill_id: session_id
		}).populate({
			path: 'bill_items'
		}).populate({
			path: 'users'
		}).exec(function (err, doc) {
			debug("session Data:");
			debug(doc);
			var response = {
				data: {
					type: 'session_data',
					id: 0,
					attributes: {
						bill: doc
					}
				}
			};
			resolve(response);
		});
	});
}

module.exports.fetchBillItems = function(session_id) {
	return new Promise(function (resolve) {
		Bills.findOne({
			bill_id: session_id
		}).populate({
			path: 'bill_items'
		}).exec(function (err, doc) {
			debug("session items:");
			debug(doc);
			var response = {
				data: {
					type: 'bill_items',
					id: 0,
					attributes: {
						items: doc.bill_items,
						bill_total: doc.bill_total,
						bill_unclaimed_total : doc.bill_unclaimed_total
					}
				}
			};
			resolve(response);
		});
	});
}

module.exports.fetchBillUsers = function(session_id) {
	return new Promise(function (resolve) {
		Bills.findOne({
			bill_id: session_id
		}).populate({
			path: 'users'
		}).exec(function (err, doc) {
			debug("session users:");
			debug(doc);
			var response = {
				data: {
					type: 'bill_users',
					id: 0,
					attributes: {
						users: doc.users
					}
				}
			};
			resolve(response);
		});
	});
}

module.exports.fetchBillOwner = function(session_id) {
	return new Promise(function (resolve) {
		Bills.findOne({
			bill_id: session_id
		}).populate({
			path: 'users'
		}).exec(function (err, doc) {
				var response = {
					data: {
						type: 'bill_users',
						id: 0,
						attributes: {
							owner_id: doc.users[0].u_id,
							owner: doc.users[0].u_nickname
						}
					}
				};
				resolve(response);
		});
	});
}

module.exports.fetchUserClaims = function(userId) {
	return new Promise(function (resolve) {
		Users.findOne({
			u_id: userId
		}).populate({
			path: 'item_claimed'
		}).exec(function (err, doc) {
			debug("claims by user:");
			debug(doc);
			var response = {
				data: {
					type: 'bill_users',
					id: 0,
					attributes: {
						u_id: userId,
						claims: doc.item_claimed
					}
				}
			};
			resolve(response);
		});
	});
}

module.exports.getOriginalImage = function(session_id) {
	return new promise(function(resolve) {
		Bills.findOne({
			bill_id: session_id
		}).populate({
			path: "bill_image"
		}).exec(function (err, doc) {
			var image = doc.bill_image;
			resolve(image);
		});
	});
}

/**
 * This module will terminate the existing session when called.
 * @param {request} req req used by Express.js to fetch data from the client.
 *                      Session is fetched from req.body.session_id.
 * @param {response} res res used by Express.js to send responses back to the
 *                       client.
 * @param {object} next
 * @returns HTTP status 200 using res.send().
 */
/* module.exports.terminateSession = function (req, res, next) {
  debug("Terminate Session called");

  var session = req.body.session_id;
  var query = Bills.find({
    bill_id: session
  });

  query.remove({
    users: {
      $size: 0
    }
  }, function (err) {
    if (err) return handleError(err);
  });
  debug('Sending response (status: 200)');
  res.status(200).send("Success");
} */

module.exports.validateSessionData = function (session, user) {
	return new Promise(function (resolve) {
		debug("Validating: "+session);
		var validated = false;
		Bills.findOne({
			bill_id: session
		}).populate({
			path: 'users'
		}).exec(function (err, doc) {
			if(err) {
				validated = false;
			}
			debug(doc);
			doc.users.forEach(function(iter){
				if(iter.u_id == user){
					validated = true;
					var responseT = {
						data: {
							type: 'validation',
							id: 0,
							attributes: {
								valid: validated
							}
						}
					};
					resolve(responseT);
				}
			});
			debug("session owner:");
			debug(doc);
			var responseF = {
				data: {
					type: 'validation',
					id: 0,
					attributes: {
						valid: validated
					}
				}
			};
			resolve(responseF);
		});
	});
	return true;
}
