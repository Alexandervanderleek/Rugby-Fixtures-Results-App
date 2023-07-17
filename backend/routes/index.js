const axios = require('axios')
require('dotenv').config()



const configureRoutes = (app) => {
   app.get('/api/today',(req,res)=>{
            try{
                axios({
                    method: 'get',
                    url: 'https://v1.rugby.api-sports.io/games',
                    signal: AbortSignal.timeout(8000),
                    headers: {
                        "x-rapidapi-host": "v1.rugby.api-sports.io",
		                "x-rapidapi-key": process.env.API_KEY
                    },
                    params: {
                        date: "2023-07-15"
                    },
                }).catch((err)=>{
                    res.status(500).json({results: 
                        {
                            errors: ["SERVERERROR"]
                        }
                    })
                }).then((result)=>{
                    if(result){
                        if(result?.data && (result?.data?.errors?.length < 1)){
                            res.status(200).json({results: result.data})
                        }else{
                            res.status(500).json({results: 
                               {
                                errors: ["SERVERERROR"]
                               }
                            })
                        }
                    }
                    
                    
                })
            }catch(err){
                console.log(err)
                res.status(500).json({results: 
                    {
                        errors: ["SERVERERROR"]
                    }
                })
            }        
           
    })

    app.get('/api/leagues',(req,res)=>{
        try{
            axios({
                method: 'get',
                url: 'https://v1.rugby.api-sports.io/leagues',
                signal: AbortSignal.timeout(8000),
                headers: {
                    "x-rapidapi-host": "v1.rugby.api-sports.io",
                    "x-rapidapi-key": process.env.API_KEY
                },
                params: {
                    season: (new Date()).getFullYear()
                },
            }).catch((err)=>{
                res.status(500).json({results: 
                    {
                        errors: ["SERVERERROR"]
                    }
                })
            }).then((result)=>{
                if(result){
                    if(result?.data && (result?.data?.errors?.length < 1)){
                        res.status(200).json({results: result.data})
                    }else{
                        res.status(500).json({results: 
                           {
                            errors: ["SERVERERROR"]
                           }
                        })
                    }
                }
                
                
            })
        }catch(err){
            res.status(500).json({results: 
                {
                    errors: ["SERVERERROR"]
                }
            })
        }        
       
    })


    app.get('/api/league',(req,res)=>{
        try{
            axios({
                method: 'get',
                url: 'https://v1.rugby.api-sports.io/games',
                signal: AbortSignal.timeout(8000),
                headers: {
                    "x-rapidapi-host": "v1.rugby.api-sports.io",
                    "x-rapidapi-key": process.env.API_KEY
                },
                params: {
                    league: +req.query.id,
                    season: (new Date()).getFullYear()
                },
            }).catch((err)=>{
                console.log(err)
                res.status(500).json({results: 
                    {
                        errors: ["SERVERERROR"]
                    }
                })
            }).then((result)=>{
                if(result){
                    if(result?.data && (result?.data?.errors?.length < 1)){
                        res.status(200).json({results: result.data})
                    }else{
                        res.status(500).json({results: 
                           {
                            errors: ["SERVERERROR"]
                           }
                        })
                    }
                }
                
                
            })
        }catch(err){
            res.status(500).json({results: 
                {
                    errors: ["SERVERERROR"]
                }
            })
        }        
       
    })


}

module.exports= configureRoutes;