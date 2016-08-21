define(['jquery', 'backend', 'icanhaz'], function($, backend){
    return {
        init: function(){
            backend.loadTemplates()
                .done(function(){
                    backend.loadFlats()
                        .done(function(){
                            this.afterLoad();
                        }.bind(this))
                }.bind(this));
        },

        afterLoad: function(){
            $.each($(backend.templates).siblings('script'), function(index, scr){
                if(!ich[scr.id]){
                    ich.addTemplate(scr.id, scr.innerHTML);
                }
            });
            $('body').html(ich.mainTmpl({length: backend.flats.length >= 5}));
            $('button.addFlat').click(function(e){
                e.preventDefault();
                var form = $('form.add-container');
                var formData = form.serializeArray(), sendData = {}, validated = true;
                formData.forEach(function(key){
                    if(key.value === ''){
                        validated = false;
                    } else {
                        sendData[key.name] = key.value;
                    }
                });
                if (validated) {
                    form.find('.error').hide();
                    backend.addFlat(sendData)
                        .done(function(){
                            this.init();
                        }.bind(this));
                } else {
                    form.find('.error').show();
                }
            }.bind(this));
            $('button.countFlat').click(function(e){
                e.preventDefault();
                var form = $('form.search-container');
                form.find('.answer').hide();
                form.find('.error').hide();
                var formData = form.serializeArray(), sendData = [1], validated = true;
                formData.forEach(function(key){
                    if(key.value === ''){
                        validated = false;
                    } else {
                        sendData.push(+key.value);
                    }
                });
                if (validated) {
                    var answer = this.countFlat(sendData);
                    form.find('.answer').show().find('.price').html(answer);
                } else {
                    form.find('.error').show();
                }

            }.bind(this));
            $('button.reload').click(function(){
                this.init();
            }.bind(this));
        },

        countFlat: function(flat){
            var thetas = [1, 1, 1, 1],
                tempThetas = [1, 1, 1, 1],
                alpha = 0.01,
                learnData = [],
                answersData = [],
                fixes = [1, 1, 100, 10],
                answer = 0;
            backend.flats.forEach(function(flatData){
                learnData.push([
                    1 / fixes[0],
                    +flatData.district / fixes[1],
                    flatData.area / fixes[2],
                    flatData.rooms / fixes[3]
                ]);
                answersData.push(flatData.price/1000000)
            });

            var costFunction = this.getCostFunction(thetas, learnData, answersData, true);


            while(costFunction > 0.01){
                thetas.forEach(function(theta, thetaIndex){
                    tempThetas[thetaIndex] = thetas[thetaIndex] - alpha * this.getCostFunction(
                        thetas,
                        learnData,
                        answersData,
                        false,
                        thetaIndex
                    )
                }.bind(this));
                thetas.forEach(function(theta, thetaIndex){
                    thetas[thetaIndex] = tempThetas[thetaIndex];
                });
                costFunction = this.getCostFunction(thetas, learnData, answersData, true);
            }

            fixes.forEach(function(fix, index){
                answer += (thetas[index] * (flat[index] / fix));
            });


            return Math.round(answer * 1000000);

        },

        getCostFunction: function(thetas, learnData, answersData, isCost, costIndex){
            var sum = 0, part = 0;
            learnData.forEach(function(learnFlat, flatIndex){
                thetas.forEach(function(theta, index){
                    part += theta * learnFlat[index];
                });
                part -= answersData[flatIndex];
                if (isCost) {
                    part = part * part;
                } else {
                    part = part * learnFlat[costIndex];
                }

                sum += part;
                part = 0;
            });
            sum = sum * (1/learnData.length);

            if (isCost) {
                sum = sum/2;
            }

            return sum;
        }
    };
});