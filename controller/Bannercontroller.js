const Banner=require("../models/bannermodels")

module.exports={
    BannerGET:async(req,res)=>{
        try {
           const banner=await Banner.find({});
           res.render('admin/banner',{banner}) 
        } catch (error) {
            console.log(error.message);
        }
      },
      addBannerGet:async(req,res)=>{
        try {
          res.render('admin/addbanner')  
        } catch (error) {
            console.log(error.message);
        }
      },
      addBannerPost:async(req,res)=>{
        try {
         const{title,description,targeturl}=req.body
         const imageFilename = req.file.filename;
         const BnData=new Banner({
            title,
            description,
            image:imageFilename,
            targeturl,
         })
         await BnData.save()
         res.redirect('/admin/banner');
        } catch (error) {
            console.log(error.message);
        }
      },
      editBannerGet:async(req,res)=>{
        try {
           const id=req.query.id
           const data=await Banner.findOne({_id:id})
           res.render('admin/editbanner',{data}) 
        } catch (error) {
            console.log(error.message);
        }
      },
      editBannerPost:async(req,res)=>{
        try {
            const _id=req.query.id
            const{title,description,targeturl}=req.body
            const imageFilename = req.file.filename;

            await Banner.findByIdAndUpdate({_id},{
                title,
                description,
                targeturl,
                $set:{image: imageFilename}
            })
            res.redirect("/admin/banner")
        } catch (error) {
            console.error(error);
      res.status(500).send("Internal Server Error");
        }
      },
      deleteBannerGet:async(req,res)=>{
        try {
            const _id=req.params.id
            const banner=await Banner.findById({_id})
            if(!banner){
                return res.render('admin/banner',{message:'banner not found'})
              }
              else{
                await Banner.findByIdAndDelete({_id})
                console.log('banner delete successfully');
              }
              res.redirect("/admin/banner")
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
      },

}