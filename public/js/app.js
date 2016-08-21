requirejs.config({
    paths: {
        jquery: './lib/jquery',
        icanhaz: './lib/icanhaz',
        backend: './backend',
        controller: './controller'
    }
});
requirejs(['controller'], function(controller){
    controller.init();
});