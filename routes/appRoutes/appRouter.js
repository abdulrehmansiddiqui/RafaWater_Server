let express = require('express');
let generalController = require('../../controllers/generalController/userController');
let passport = require('passport');



let router = express.Router();
let requireAuth = passport.authenticate('jwt', { session: false });

// /api/app/dala/
// new and updated
router.post('/user/login', generalController.authenticate);
router.post('/user/register', generalController.addNew);
router.get('/getuser/:userId', generalController.getUser);
router.post('/updateuser', generalController.updateUser);
router.post('/user/update/profileImg', generalController.updateProfilePic);
router.post('/user/update/password', generalController.updatePassword);
router.get('/user/getAll', generalController.getAllUser);
router.get('/user/byCreatedById/:userId', generalController.getUserByCreatedById);
router.get('/verifyUser/:userId', generalController.verifyUser);
router.post('/forget/password', generalController.forgetPassword);
router.get('/reset/password/:userId', generalController.resetPassword);

 

/**
 * Check protected
 */
router.get('/protected', requireAuth, function (req, res) {
    res.send({ success: true });
});

module.exports = router;

