const Address=require('../models/addressmodels')

module.exports={
    addAddressPost:async(req,res)=>{
        console.log('onn varkiyyo');
        const user_id=req.session.user_id;

        const data={
            fullName: req.body.fullName,
            country: req.body.country,
            housename: req.body.housename,
            state: req.body.state,
            city: req.body.city,
            pincode: req.body.pincode,
            phone: req.body.phone,
            email: req.body.email
        };
        console.log(data);
        await Address.findOneAndUpdate(
            {user:user_id},
            {$set:{user:user_id},$push:{address:data}}
            );
            res.redirect('/user/success');
    },
    deleteAddress:async(req,res)=>{
        try {
            const userId=req.session.user_id
            const addressId = req.body.id
            console.log(addressId,'yoyo honey sigh');
            
            await Address.updateOne({user:userId},{$pull:{address:{_id:addressId}}})
            
            res.json({deleted:true})
        } catch (error) {
            
        }
    },
    addaddressprofile:async(req,res)=>{
        try {
            const userId = req.session.user_id;
            console.log(userId,'addaddressprofile');
    
            const data = {
                fullName: req.body.fullName,
                country: req.body.country,
                housename: req.body.housename,
                state: req.body.state,
                city: req.body.city,
                pincode: req.body.pincode,
                phone: req.body.phone,
                email: req.body.email
            };
    
            // Update the address
            const updatedAddress = await Address.findOneAndUpdate(
                { user: userId },
                { $set: { user: userId }, $push: { address: data } },
                { upsert: true, new: true }
            );
    
            // Send a JSON response
            res.json({ add: true, address: updatedAddress });
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ add: false, error: "Internal Server Error" });
        }

    },
    successGet:async(req,res)=>{
        try {
            // const id = req.body.id;
            const userId = req.session.user_id;
            console.log( userId ,'idiyano');
            res.render('user/success')
        } catch (error) {
            console.log(error);
        }
    },
    editaddresses:async(req,res)=>{
        try {
            console.log('hi')
            const userId = req.session.user_id;
            console.log(userId);
            console.log(req.body.addressId);
            console.log(req.body.phone)
      
            const updatedAddress = await Address.findOneAndUpdate(
                { user: userId, 'address._id': req.body.addressId },
                {
                    $set: {
                        'address.$.fullName': req.body.fullName,
                        'address.$.country': req.body.country,
                        'address.$.housename': req.body.housename,  
                        'address.$.state': req.body.state,
                        'address.$.city': req.body.city,
                        'address.$.pincode': req.body.pincode,
                        'address.$.phone': req.body.phone,
                        'address.$.email': req.body.email,
                    },
                },
                { new: true } 
            );
      
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true});
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }


}