const TelegramBot = require('node-telegram-bot-api');
const { Context } = require('./context.js');
const GigaChat = require('gigachat-node').default;
require('dotenv').config();

const TG_BOT_KEY = process.env.TG_BOT_KEY;
const GIGACHAT_CLIENT_SECRET_KEY = process.env.GIGACHAT_CLIENT_SECRET_KEY;

const bot = new TelegramBot(TG_BOT_KEY, {
    polling: true
})

const client = new GigaChat(
    clientSecretKey=GIGACHAT_CLIENT_SECRET_KEY, 
    isIgnoreTSL=true, 
    isPersonal=true
);
client.createToken();

const clientContext = new Context();

bot.on('message', async ctx => {

    try {
        const message = ctx.text;
        const userId = ctx.from.id;

        if(message == '/start') {

            bot.sendMessage(userId, 'Здравствуйте! Я **Шалигула Aide** - полностью бесплатный ассистент на базе GigaChat. Пока что я понимаю только текстовые сообщения. Если у Вас есть вопросы - просто напишите сообщение.', {
                parse_mode: 'Markdown'
            })

        }
        else {
            const context = clientContext.getContext(userId);

            const messageWait = await bot.sendMessage(userId, 'Пожалуйста, подождите...');
            await bot.sendChatAction(userId, 'typing');

            try {
                const messages = [{
                    role: "user",
                    content: message
                }]

                if(context) {
                    messages.unshift(
                        {
                            role: "user",
                            content: context.user
                        },
                        {
                            role: "assistant",
                            content: context.assistant
                        }
                    )
                }

                const responce = await client.completion({
                    "model": "GigaChat:latest",
                    "messages": messages
                });

                const completion = responce.choices[0].message.content;

                bot.sendMessage(userId, completion, {
                    parse_mode: 'Markdown'
                });

                bot.deleteMessage(userId, messageWait.message_id);

                clientContext.setContext(userId, {
                    user: message,
                    assistant: completion
                })
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