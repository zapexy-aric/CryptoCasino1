
import { Telegraf, Context } from 'telegraf';
import { storage } from './storage';
import { telegramAdmins } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { message } from 'telegraf/filters';

let botInstance: Telegraf | null = null;

const isAdmin = async (ctx: Context, next: () => any) => {
    const from = ctx.from;
    if (!from) return;

    const admin = await storage.db.select().from(telegramAdmins).where(eq(telegramAdmins.telegramId, from.id.toString()));

    if (admin.length > 0) {
        return next();
    }

    ctx.reply('You are not authorized to use this command.');
}

const register = async (ctx: Context) => {
    const from = ctx.from;
    if (!from) return;

    const allAdmins = await storage.db.select().from(telegramAdmins);

    if (allAdmins.length > 0) {
        ctx.reply('An admin is already registered.');
        return;
    }

    await storage.db.insert(telegramAdmins).values({
        telegramId: from.id.toString(),
        username: from.username,
    });

    ctx.reply('You have been registered as a bot admin.');
}

const kick = async (ctx: Context) => {
    if (!ctx.chat || !('id' in ctx.chat)) return;
    if (!ctx.message || !('reply_to_message' in ctx.message)) return;

    const userId = ctx.message.reply_to_message.from.id;
    const chatId = ctx.chat.id;

    try {
        await ctx.telegram.kickChatMember(chatId, userId);
        ctx.reply('User has been kicked.');
    } catch (e) {
        console.error(e);
        ctx.reply('Could not kick user.');
    }
}

const ban = async (ctx: Context) => {
    if (!ctx.chat || !('id' in ctx.chat)) return;
    if (!ctx.message || !('reply_to_message' in ctx.message)) return;

    const userId = ctx.message.reply_to_message.from.id;
    const chatId = ctx.chat.id;

    try {
        await ctx.telegram.banChatMember(chatId, userId);
        ctx.reply('User has been banned.');
    } catch (e) {
        console.error(e);
        ctx.reply('Could not ban user.');
    }
}

const mute = async (ctx: Context) => {
    if (!ctx.chat || !('id' in ctx.chat)) return;
    if (!ctx.message || !('reply_to_message' in ctx.message)) return;

    const userId = ctx.message.reply_to_message.from.id;
    const chatId = ctx.chat.id;

    try {
        await ctx.telegram.restrictChatMember(chatId, userId, {
            permissions: {
                can_send_messages: false,
            }
        });
        ctx.reply('User has been muted.');
    } catch (e) {
        console.error(e);
        ctx.reply('Could not mute user.');
    }
}

const unmute = async (ctx: Context) => {
    if (!ctx.chat || !('id' in ctx.chat)) return;
    if (!ctx.message || !('reply_to_message' in ctx.message)) return;

    const userId = ctx.message.reply_to_message.from.id;
    const chatId = ctx.chat.id;

    try {
        await ctx.telegram.restrictChatMember(chatId, userId, {
            permissions: {
                can_send_messages: true,
                can_send_media_messages: true,
                can_send_polls: true,
                can_send_other_messages: true,
                can_add_web_page_previews: true,
                can_change_info: true,
                can_invite_users: true,
                can_pin_messages: true,
            }
        });
        ctx.reply('User has been unmuted.');
    } catch (e) {
        console.error(e);
        ctx.reply('Could not unmute user.');
    }
}

const del = async (ctx: Context) => {
    if (!ctx.message || !('reply_to_message' in ctx.message)) return;

    const messageId = ctx.message.reply_to_message.message_id;

    try {
        await ctx.telegram.deleteMessage(ctx.chat.id, messageId);
        ctx.deleteMessage();
    } catch (e) {
        console.error(e);
        ctx.reply('Could not delete message.');
    }
}


export const initBot = () => {
    if (process.env.TELEGRAM_BOT_TOKEN) {
        botInstance = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

        botInstance.start((ctx) => ctx.reply('Welcome'));
        botInstance.command('register', (ctx) => register(ctx));
        botInstance.command('kick', isAdmin, (ctx) => kick(ctx));
        botInstance.command('ban', isAdmin, (ctx) => ban(ctx));
        botInstance.command('mute', isAdmin, (ctx) => mute(ctx));
        botInstance.command('unmute', isAdmin, (ctx) => unmute(ctx));
        botInstance.command('del', isAdmin, (ctx) => del(ctx));
        botInstance.command('help', (ctx) => {
            const helpMessage = `
Here are the available commands:

/register - Register as a bot admin (first user only)
/kick - Kick a user (reply to a message)
/ban - Ban a user (reply to a message)
/mute - Mute a user (reply to a message)
/unmute - Unmute a user (reply to a message)
/del - Delete a message (reply to a message)
/help - Show this help message
            `;
            ctx.reply(helpMessage);
        });

        botInstance.on('new_chat_members', (ctx) => {
            const newMembers = ctx.message.new_chat_members;
            for (const member of newMembers) {
                ctx.reply(`Welcome to the group, ${member.first_name}!`);
            }
        });

        console.log('Telegram bot initialized.');
    } else {
        console.warn('TELEGRAM_BOT_TOKEN is not set. Telegram bot will not be started.');
    }
    return botInstance;
}

export const getBot = () => botInstance;

export const setupWebhook = async (bot: Telegraf, app: any) => {
    const domain = process.env.REPL_EXTERNAL_URL;

    if (domain) {
        const webhookPath = `/telegraf/${bot.secretPathComponent()}`;
        app.use(bot.webhookCallback(webhookPath));
        await bot.telegram.setWebhook(`https://${domain}${webhookPath}`);
        console.log(`Telegram bot webhook is set up on https://${domain}${webhookPath}`);
    } else {
        console.warn('REPL_EXTERNAL_URL not found. Bot will use polling instead of webhooks.');
        bot.launch();
    }
}
