define(['jquery'], function($){
    return {
        templates: {},
        flats: [],
        loadTemplates: function(){
            return $.ajax({
                'type': 'get',
                'url': 'templates.html',
                'success': function(tmpl){
                    this.templates = tmpl;
                }.bind(this)
            });
        },
        loadFlats: function(){
            return $.ajax({
                'type': 'get',
                'url': 'getFlats',
                success: function(flts){
                    this.flats = flts;
                }.bind(this)
            });
        },
        addFlat: function(data){
            return $.ajax({
                type: 'post',
                url: 'addFlat',
                data: data
            });
        }
    }
});