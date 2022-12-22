/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const util = require('./util');
const constants = require('./constants');
const logic = require('./logic');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        currentReleaseNumber = 0;
        const speakOutput = 'Buenas, bienvenido a las novedades de Earth Food...';
        getRelease();
        currentReleaseStatus = 'release';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const ReleaseIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ReleaseIntent';
    },
    handle(handlerInput) {
        let speakOutput = '';
        if ((currentReleaseStatus === 'release') || (currentReleaseStatus === 'continue')) {
            speakOutput += 'La novedad ' + ' ' + currentRelease.id + ' ' + currentRelease.release + '. ... ' + ', ¿desea ver la siguiente novedad?...';
            currentReleaseNumber++;
            getRelease();
        } else if (currentReleaseStatus === 'finish') {
            speakOutput +=  'La novedad ' + ' ' + currentRelease.id + ' ' + currentRelease.release + '. ... ';
            currentReleaseNumber++;
            speakOutput += ' esta es la ultima novedad por ahora! Nos vemos';

            return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const ContinueIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ContinueIntent';
    },
    handle(handlerInput) {
        let speakOutput = '';
        if ((currentReleaseStatus === 'release') || (currentReleaseStatus === 'continue')) {
            speakOutput += 'La novedad ' + ' ' + currentRelease.id + ' ' + currentRelease.release + '. ... ' + ', ¿desea ver la siguiente novedad?...';
            currentReleaseNumber++;
            getRelease();
        } else if (currentReleaseStatus === 'finish') {
            speakOutput +=  'La novedad ' + ' ' + currentRelease.id + ' ' + currentRelease.release + '. ... ';
            currentReleaseNumber++;
            speakOutput += ' esta es la ultima novedad por ahora! Nos vemos!';

            return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const ReminderIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RemindProductIntent';
    },
    async handle(handlerInput) {
        const {atributesManager, serviceClientFactory, requestEnvelope} = handlerInput;
        const sessionAtributes = atributesManager.getSessionAttributes();
        const {intent} = requestEnvelope.request;
        
        const message = Alexa.getSlotValue(requestEnvelope, 'message');
        
        // This is to create a reminder via the reminders Api
        try {
            const {permissions} = requestEnvelope.context.System.user;
            if (!(permissions && permissions.consentToken))
                throw {StatusCode: 401, message: 'No permissions available'};
            const reminderServiceClient = serviceClientFactory.getReminderManagementServiceCLient();
            const remindersList = await reminderServiceClient.getReminders();
            const previousReminder = sessionAtributes['reminderId'];
            if (previousReminder) { 
                try {
                    if (remindersList.totalCount !== "0") {
                        await reminderServiceClient.deleteReminder(previousReminder);
                        delete sessionAtributes['reminderId'];
                        console.log('Deleted previous reminder token: ' + previousReminder);
                    }
                } catch(error) {
                    //console.log('Failed to delete reminder: ' = previousReminder + ' via ' + JSON.stringify(error));
                }
            }
            // Creacion de la estructura del recordatorio
            const reminder = logic.createEarthFoodReminder(Alexa.getLocale(requestEnvelope), message);
            const reminderResponse = await reminderServiceClient.createReminder(reminder);
            sessionAtributes['reminderId'] = reminderResponse.alertToken;
            //console.log('Reminder created with token: ' + reminderResponse.alertToken);
            let speechText = handlerInput.t('message');
            speechText += handlerInput.t('help');
        } catch(error) {
            //console.log(JSON.stringify(erorr));
        }
        
        return handlerInput.responseBuilder
            .reprompt()
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Para ejecutar la skill tienes que preguntar por "novedades"';

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
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = '¡Adiós!';

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
        const speakOutput = 'Perdón no sé sobre eso, inténtalo de nuevo.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            // .reprompt(speakOutput)
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
        const speakOutput = 'Perdón, no entiendo lo que me has preguntado, por favor intentalo de nuevo.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const releaseList = require('./release-list');
let currentReleaseNumber = 0;
var currentRelease = null;
var currentReleaseStatus = null;

function getRelease() {
    if (Object.keys(releaseList).length === 0) {
        return null;
    } 
    currentRelease = releaseList[currentReleaseNumber];
    if (currentRelease.last === true) {
        currentReleaseStatus = 'finish';
    } else {
        currentReleaseStatus = 'release';
    }
    return currentRelease;
}

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        ReleaseIntentHandler,
        ContinueIntentHandler,
        ReminderIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();