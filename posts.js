module.exports = function(app, db){

    app.post('/flats/addFlat', function(req, resp){
        var params = req.body;

        db.SMEMBERS('flats', function(err, keys){
            var flatId = 0;
            keys.forEach(function(key){
                if(parseFloat(key) > parseFloat(flatId)){
                    flatId = parseFloat(key);
                }
            });
            flatId++;

            db.HMSET('flat_'+flatId, {
                id: flatId,
                district: params.district,
                area: params.area,
                rooms: params.rooms,
                price: params.price
            }, function(){
                db.SADD('flats', flatId, function(){
                    resp.end();
                });
            });

        });
    });

    app.get('/flats/getFlats', function(req, res){
        db.SMEMBERS('flats', function(err, keys){
            var counter = 0,
                flats = [],
                returnFlats = function(){
                    res.json(flats);
                    res.end();
                };
            if(!keys.length){
                returnFlats();
            } else {
                keys.forEach(function(key){
                    db.HGETALL('flat_'+key, function(err, flatInfo){
                        flats.push(flatInfo);
                        counter++;
                        if(counter == keys.length){
                            returnFlats();
                        }
                    });
                });
            }
        });
    });

    app.get('/flats/delAllFlats', function(req, res){
        db.SMEMBERS('flats', function(err, keys){
            keys.forEach(function(key){
                db.DEL('flat_'+key);
            });
            db.DEL('flats');
        });
        res.end();
    })
};
