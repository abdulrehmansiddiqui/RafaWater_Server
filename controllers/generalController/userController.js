let User = require('../../model/generalModel/userRegistration');
let config = require('../../config/database');
let jwt = require('jwt-simple');


let functions = {

    authenticate: function (req, res) {
        User.findOne({
            email: req.body.email
        }, function (err, user) {
            if (err) throw err;
            if (!user) {
                res.send({ success: false, msg: 'Authentication failed, User not found' });
            } else {
                user.comparePassword(req.body.password, function (err, isMatch) {
                    if (isMatch && !err) {
                        let token = jwt.encode(user, config.secret);
                        res.json({
                            success: true,
                            token: "JWT " + token,
                            user: user,
                        })
                    } else {
                        return res.send({ success: false, msg: 'Authenticaton failed, wrong password.' });
                    }
                })
            }
        })
    },

    addNew: function (req, res) {
        if ((!req.body.email) || (!req.body.password) || (!req.body.role) || (!req.body.createdById)) {
            res.json({ success: false, msg: 'Enter all values' });
        }
        else {
            var newUser = User({
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                isActive: req.body.isActive,
                createdById: req.body.createdById,
                role: req.body.role,
                verification_code: req.body.verification_code,
                profileImg: req.body.profileImg,
                emialSubscription: req.body.emialSubscription,
                phone: req.body.phone,
                serviceSubscription: req.body.serviceSubscription,
                isVerified: req.body.isVerified,
                isVisited: req.body.isVisited,
                isDeleted: req.body.isDeleted
            })

            newUser.save(function (err, user) {
                if (err) {
                    return res.send({ success: false, msg: 'Email already exist', err })
                }
                else {
                    var objId = user._id.toString()
                    var userId = objId.slice(objId.length - 5)
                    User.findByIdAndUpdate({ _id: user._id }, { $set: { userId: userId } }, function (err, doc) {
                        if (err) {
                            return res.send({ success: false, msg: 'Failed to save' })
                        }
                        else {
                            let token = jwt.encode(user, config.secret)
                            res.json({
                                success: true,
                                msg: 'Successfully saved',
                                token: "JWT " + token,
                                user
                            })
                        }
                    })
                }
            })
        }
    },

    getUser: function (req, res) {
        User.findOne({
            userId: req.params.userId
        }, function (err, user) {
            if (err) throw err;
            if (!user) {
                res.send({ success: false, msg: 'Invalid user id , Profile not found' });
            } else {
                res.json({ success: true, user: user });
            }
        })
    },


    updateUser: function (req, res) {
        User.findOneAndUpdate({ userId: req.body.userId }, req.body, function (err, user) {
            if (err) {
                return res.send({ success: false, msg: 'Failed to update or Email already exist.' })
            }
            else {
                res.json({ success: true, msg: 'Successfully updated' });
            }
        })
    },

    updateProfilePic: function (req, res) {
        var userId = req.body.userId
        var image = req.body.profileImg

        if (!userId || !image) {
            return res.send({ success: false, msg: "provide userId and profile image url" })
        }
        User.findOneAndUpdate({ userId: userId }, { $set: { profileImg: image } }, function (error, save) {
            if (error) {
                return res.send({ success: false, msg: "Failed to save image" })
            }
            else {
                res.json({ success: true, msg: 'Image successfully updated', user: save });
            }
        })
    },


    updatePassword: function (req, res) {
        var newPassword = req.body.newPassword
        var oldPassword = req.body.oldPassword
        if (!newPassword || !oldPassword) {
            return res.send({ success: false, msg: 'Provide old password and new password' })
        }
        User.findOne({ userId: req.body.userId }, function (err, user) {
            if (err) {
                return res.send({ success: false, msg: 'Invalid user id ' })
            }
            else {
                user.comparePassword(oldPassword, function (error, isMatch) {
                    if (isMatch && !err) {
                        user.password = newPassword
                        user.save()
                            .then((asd) => {
                                res.json({ success: true, msg: "successfully saved password", user })
                            })
                    } else {
                        return res.send({ success: false, msg: 'Authenticaton failed, wrong password.' });
                    }
                })
            }
        })
    },

    getByRole: function (req, res) {
        User.find({
            role: req.params.role
        }, function (err, user) {
            if (err) throw err;
            if (!user) {
                res.status(403).send({ success: false, msg: 'Role not found' });
            } else {
                res.json({ success: true, user: user });
            }
        })
    },


    getAllUser: function (req, res) {
        User.find({}, function (err, user) {
            if (err) throw err;
            if (!user) {
                res.status(403).send({ success: false, msg: 'Role not found' });
            } else {
                res.json({ success: true, user: user });
            }
        })
    },


    deleteUserById: function (req, res) {
        var userId = req.params.userId
        user.findOneAndDelete({
            userId
        }, function (err, user) {
            if (err) throw err;
            if (!user) {
                res.status(403).send({ success: false, msg: 'user not found' });
            } else {
                res.json({ success: true, msg: "successfully deleted" });
            }
        })
    },

    getUserByCreatedById: function (req, res) {

        var userId = req.params.userId

        User.find({ createdById: userId }, function (err, data) {
            if (err) throw err;
            if (!data) {
                return res.send({ success: true, msg: "No user Found", data: [] })
            }
            else {
                return res.send({ success: true, msg: "fetched user", data })
            }
        })

    },

    verifyUser: function (req, res) {
        var userId = req.params.userId
        User.findOneAndUpdate({ userId: userId }, { isVerified: true }, function (err, data) {
            if (err) throw err;
            if (!data) {
                return res.send({ success: true, msg: "No user Found" })
            }
            else {
                return res.send("Verification successfull, Thankyou for verification now you can use Dala3 application")
            }
        })

    },


    forgetPassword: function (req, res) {
        var email = req.body.email
        User.findOne({ email: email }, function (err, data) {
            if (err) throw err;
            if (!data) {
                return res.send({ success: false, msg: "Email not found" })
            }
            else {
                return res.send({ success: true, msg: "Email send successfully" })
            }
        })
    },

    resetPassword: function (req, res) {
        User.findOne({
            userId: req.params.userId
        }, function (err, user) {
            if (err) throw err;
            if (!user) {
                res.send({ success: false, msg: 'email not found' });
            } else {
                user.password = '123456'
                user.save()
                    .then((asd) => {
                        return res.send("Password reset successfully, Now you use '123456' as password. kindly change your password once you login ");
                    })
            }
        })
    },


};

module.exports = functions;