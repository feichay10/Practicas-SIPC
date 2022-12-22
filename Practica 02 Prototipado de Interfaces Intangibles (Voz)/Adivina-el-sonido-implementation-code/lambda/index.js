/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        initData();
        const questionText = getInstrument();
        currentStatus = 'Question';
        const speakOutput = 'Bienvenido a adivina el sonido version Castolo. Comenzamos con el primer sonido que debe adivinar: ' + questionText;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const AnswerIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AnswerIntent';
    },
    handle(handlerInput) {
        const AnswerValue = handlerInput.requestEnvelope.request.intent.slots.message.value;
        let speakOutput = '';
        if (currentStatus === 'Continue') {
            speakOutput += 'Responde sí o no';
        }
        else {
            if (AnswerValue === currentIndex.answer) {
                speakOutput += 'Respuesta correcta! ... ' + currentIndex.answer + '.';
                hits++;
            }
            else  {
                speakOutput += 'Respuesta incorrecta, la respuesta correcta es ' +  currentIndex.answer + '.';
            }
        }
        currentIndex = null;
        speakOutput += ' ... Continuamos? ';
        currentStatus = 'Continue';
        
        if (exit) {
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
        } 
        else {
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
    }
};

const RepeatIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RepeatIntent';
    },
    handle(handlerInput) {
        let speakOutput = '';
        if (currentStatus === 'Question') {
            speakOutput += 'Repetimos! ... ' + getInstrument(false);
        }
        else if (currentStatus === 'Continue') {
            speakOutput += 'Continuamos? ';
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


const YesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'YesIntent';
    },
    handle(handlerInput) {
        const speakOutput = getInstrument();
        currentStatus = 'Question';


        if (exit) {
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .withShouldEndSession(true)
                .getResponse();
        } 
        else {
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'El juego consiste en adivinar una serie de sonidos que iran sonando de manera aleatoria.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Has conseguido acertar ' + hits + ' de ' + count + ' preguntas. ... Hasta luego!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Lo siento, no entiendo lo que me dices. Por favor inténtalo otra vez.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Lo siento, tuve problemas para hacer lo que me pediste. Inténtalo de nuevo.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};



let questionsList, currentIndex, count, hits, pending, currentStatus, exit;
function initData() {
    questionsList = {
        '0' : {
            'id' : '0',
            'question' : '¿Que sonido es ...?',
            'answer' : 'trompeta',
            'sound' : "soundbank://soundlibrary/musical/amzn_sfx_trumpet_bugle_01"
        },
        '1' : {
            'id' : '1',
            'question' : '¿Que sonido es ...?',
            'answer' : 'guitarra',        
            'sound' : "soundbank://soundlibrary/musical/amzn_sfx_electric_guitar_02"
        },
        '2' : {
            'id' : '2',
            'question' : '¿Que sonido es ...?',
            'answer' : 'batería',
            'sound' : "soundbank://soundlibrary/musical/amzn_sfx_drum_and_cymbal_02"
        },
        '3' : {
            'id' : '3',
            'question' : '¿Que sonido es ...?',
            'answer' : 'coche',
            'sound' : "soundbank://soundlibrary/vehicles/cars/cars_11"
        },
        '4' : {
            'id' : '4',
            'question' : '¿Que sonido es ...?',
            'answer' : 'tren',
            'sound' : "soundbank://soundlibrary/vehicles/trains/train_01"
        },
        '5' : {
            'id' : '5',
            'question' : '¿Que sonido es ...?',
            'answer' : 'lluvia',
            'sound' : "soundbank://soundlibrary/nature/amzn_sfx_rain_01"
        },
        '6' : {
            'id' : '6',
            'question' : '¿Que sonido es ...?',
            'answer' : 'teléfono',
            'sound' : "soundbank://soundlibrary/telephones/modern_rings/modern_rings_01"
        },
        '7' : {
            'id' : '7',
            'question' : '¿Que sonido es ...?',
            'answer' : 'helicóptero',
            'sound' : "soundbank://soundlibrary/aircrafts/helicopter/helicopter_02"
        }
    };
    currentIndex = null;
    count = 0;
    hits = 0;
    pending = null;
    currentStatus = null;
    exit = false;
}



function getRandomItem(obj) {
    if (Object.keys(obj).length === 0) {
        return null;
    }
    currentIndex =  obj[Object.keys(obj)[Math.floor(Math.random()*Object.keys(obj).length)]];
    return currentIndex;
}


function getInstrument(random = true) {
    let speechText = '';
    if (random) {
        speechText = getRandomItem(questionsList);
        if (currentIndex === null && pending === null) {
            const speakOutput = 'Ya adivinaste todos los sonidos! ... Has conseguido acertar ' + hits + ' de ' + count + ' preguntas. ... Hasta luego!';
            exit = true;
            return speakOutput;
        }
        else if (currentIndex === null) {
            return 'Ya no te quedan más preguntas nuevas, pero sí te queda una pendiente, vamos con ella. ... ' + speechText.question;
        }
        delete questionsList[currentIndex.id];
        count++;
    }
    else {
        speechText = currentIndex;
    }
    
    const speakOutput = speechText.question + '<audio src="' + speechText.sound + '" />';
    return speakOutput
}


/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        AnswerIntentHandler,
        RepeatIntentHandler,
        HelpIntentHandler,
        YesIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();
