const TelegramBot = require('node-telegram-bot-api');
const GigaChat = require('gigachat-node').default;
require('dotenv').config();
const { db } = require('./db');

const TG_BOT_KEY = process.env.TG_BOT_KEY;
const GIGACHAT_CLIENT_SECRET_KEY = process.env.GIGACHAT_CLIENT_SECRET_KEY;

const bot = new TelegramBot(TG_BOT_KEY, {
    polling: true
})

const client = new GigaChat(
    clientSecretKey=GIGACHAT_CLIENT_SECRET_KEY, 
    isIgnoreTSL=true,
    isPersonal=true,
    true,
    true,
    './image'
);
client.createToken();

bot.on('message', async ctx => {

    try {
        const message = ctx.text;
        const userId = ctx.from.id;

        const isNewUser = await db.checkNewUser(userId);
        if(isNewUser) await db.addNewUser(userId);

        const user = await db.getUserById(userId);

        if(message == '/start') {
            bot.sendMessage(userId, 'Здравствуйте! Я **Шалигула Aide** - полностью бесплатный ассистент на базе GigaChat. Пока что я понимаю только текстовые сообщения. Если у Вас есть вопросы - просто напишите сообщение.', {
                parse_mode: 'Markdown'
            })
        }
        else {
            const messageWait = await bot.sendMessage(userId, 'Пожалуйста, подождите...');
            await bot.sendChatAction(userId, 'typing');

            try {
                const messages = [
                {
                    role: "user",
                    content: user.req
                },
                {
                    role: "assistant",
                    content: user.completion
                },
                {
                    role: "user",
                    content: message
                }];

                const responce = await client.completion({
                    "model": "GigaChat:latest",
                    "messages": messages
                });
                let completion = responce.choices[0].message.content;

                if(responce.choices[0].message.image) {
                    completion = "Может нарисовать что-то еще? Я могу нарисовать что угодно."
                    bot.sendPhoto(userId, responce.choices[0].message.image, {
                        caption: completion
                    });
                    bot.deleteMessage(userId, messageWait.message_id);
                }
                else {
                    bot.sendMessage(userId, completion, {
                        parse_mode: 'Markdown'
                    });
                    bot.deleteMessage(userId, messageWait.message_id);
                }

                db.setContext(userId, message, completion);
            }
            catch(error) {
                bot.editMessageText('Не удалось сгенерировать ответ.', {
                    chat_id: userId,
                    message_id: messageWait.message_id
                })
                console.error(error);
            }
        }

    }
    catch(error) {
        console.error(error);
    }

})

bot.on('polling_error', error => console.error(error));