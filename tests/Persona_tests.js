var Personas = require('./Personas');

var Persona = new Personas({});
Persona.init(function(err){
    if (err){
        throw err;
    }
    console.log('Persona initialized');
    console.log(Persona.getPersonas());
});



setTimeout(function(){
    console.log('Persona.getPersonas().length', Persona.getPersonas().length);
    if(Persona.getPersonas().length > 0){
        Persona.getPersona('yoda', function(response){
            console.log(utils.randomPicker(response));
        });
    }

    setTimeout(function(){
        console.log('Persona.getPersonas().length', Persona.getPersonas().length);
        if(Persona.getPersonas().length > 0){
            Persona.getPersona('kenny', function(response){
                console.log(utils.randomPicker(response));
                Persona.quit();
            });
        }
    }, 3000);

}, 3000);