exports.getPosts = (req,res,next)=>{
    res.status(200).json({
        posts:[{
            title:'first Post',
            content: 'This is the first post'
        }]
    });
};

exports.createPost = (req,res,next)=>{
    const title = req.body.title;
    const content = req.body.content;

    res.status(201).json({
        message:'Post created successfully',
        post:{
            id:Date.now().toString(),
            title:title,
            content:content
        }
    });
};