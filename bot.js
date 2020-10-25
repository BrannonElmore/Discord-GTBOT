var Discord = require('discord.js');
var {prefix} = require('./package.json');
const Sequelize = require('sequelize');
const {Op} = require('sequelize');
var auth = require('./auth.json');
var sprintf = require('sprintf-js').sprintf;
var vsprintf = require('sprintf-js').vsprintf;
var request = require('request');
var fs = require('fs');
var csvWriter = require('csv-writer').createArrayCsvWriter;

// Initialize Discord Bot
var bot = new Discord.Client();

// Globals
var boxtick = '```';
var headerstring = sprintf('%-20.20s%-20.20s%-20.20s%-3s %-3s %-3s %-3s %-3s %-3s %-3s %-3s %-12s %-12s','Family','Character','Discord','ap','aap','dp','gs', 'acc','eva','dr','dr%','Class','Last Updated');
var disptemplate = '%-20s%-20s%-20.19s%-3d %-3d %-3d %-3d %-3d %-3d %-3d %-3s %-12s';
var adminperm = 'MANAGE_ROLES';
var classes = ['Warrior', 'Ranger', 'Sorceress', 'Berserker', 'Tamer', 'Musa', 'Maehwah', 'Valkyrie', 'Kunoichi', 'Ninja', 'Wizard', 'Witch', 'Dark Knight', 'Striker', 'Mystic', 'Archer', 'Lahn', 'Shai', 'Guardian', 'Hashashin'];
const csvWStream = csvWriter({
	path: 'export_data.csv',
	header: ['Family','Character','Discord','ap','aap','dp','acc','eva','dr','dr%','Class']
});

// Initialize Primary DB
const seq = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'memberDb.sqlite',
});

const Member = seq.define('member', {
	Character: Sequelize.STRING,
	Family: Sequelize.STRING,
	AP: {type: Sequelize.INTEGER, defaultValue: 0, allowNull: false},
	AAP: {type: Sequelize.INTEGER, defaultValue: 0, allowNull: false},
	DP: {type: Sequelize.INTEGER, defaultValue: 0, allowNull: false},
	GS: {type: Sequelize.INTEGER, defaultValue: 0, allowNull: false},
	ACC: {type: Sequelize.INTEGER, defaultValue: 0, allowNull: false},
	EVA: {type: Sequelize.INTEGER, defaultValue: 0, allowNull: false},
	DR: {type: Sequelize.INTEGER, defaultValue: 0, allowNull: false},
	DR_PERC: {type: Sequelize.INTEGER, defaultValue: 0, allowNull: false},
	Class: Sequelize.STRING,
	Picture: Sequelize.STRING,
	UserID: {
		type: Sequelize.STRING,
		unique: true,
	},
	GuildID: {
		type: Sequelize.STRING,
	},
	UserTag: Sequelize.STRING,
	DISPLAY: Sequelize.STRING,
});

// Initialize castle defense DB
var seqd = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'castleDb.sqlite',
});

var Defense = seqd.define('member', {
	Character: Sequelize.STRING,
	Family: Sequelize.STRING,
	AP: {type: Sequelize.INTEGER, defaultValue: 0, allowNull: false},
	AAP: {type: Sequelize.INTEGER, defaultValue: 0, allowNull: false},
	DP: {type: Sequelize.INTEGER, defaultValue: 0, allowNull: false},
	GS: {type: Sequelize.INTEGER, defaultValue: 0, allowNull: false},
	ACC: {type: Sequelize.INTEGER, defaultValue: 0, allowNull: false},
	EVA: {type: Sequelize.INTEGER, defaultValue: 0, allowNull: false},
	DR: {type: Sequelize.INTEGER, defaultValue: 0, allowNull: false},
	DR_PERC: {type: Sequelize.INTEGER, defaultValue: 0, allowNull: false},
	Class: Sequelize.STRING,
	Picture: Sequelize.STRING,
	UserID: {
		type: Sequelize.STRING,
		unique: true,
	},
	GuildID: {
		type: Sequelize.STRING,
	},
	UserTag: Sequelize.STRING,
	DISPLAY: Sequelize.STRING,
});

// Lookup the DR% based on current DP. I named the input dr cuz I'm dumb and now too lazy to update it.
function drpercLookup(dr){
	if (dr >= 203 && dr <= 210){
		drperc = '1%';
	} else if (dr >= 211 && dr <= 217) {
		drperc = '2%';
	} else if (dr >= 218 && dr <= 225) {
		drperc = '3%';
	} else if (dr >= 226 && dr <= 232) {
		drperc = '4%';
	} else if (dr >= 233 && dr <= 240) {
		drperc = '5%';
	} else if (dr >= 241 && dr <= 247) {
		drperc = '6%';
	} else if (dr >= 248 && dr <= 255) {
		drperc = '7%';
	} else if (dr >= 256 && dr <= 262) {
		drperc = '8%';
	} else if (dr >= 263 && dr <= 270) {
		drperc = '9%';
	} else if (dr >= 271 && dr <= 277) {
		drperc = '10%';
	} else if (dr >= 278 && dr <= 285) {
		drperc = '11%';
	} else if (dr >= 286 && dr <= 292) {
		drperc = '12%';
	} else if (dr >= 293 && dr <= 300) {
		drperc = '13%';
	} else if (dr >= 301 && dr <= 307) {
		drperc = '14%';
	} else if (dr >= 308 && dr <= 314) {
		drperc = '15%';
	} else if (dr >= 315 && dr <= 321) {
		drperc = '16%';
	} else if (dr >= 322 && dr <= 328) {
		drperc = '17%';
	} else if (dr >= 329 && dr <= 334) {
		drperc = '18%';
	} else if (dr >= 335 && dr <= 340) {
		drperc = '19%';
	} else if (dr >= 341 && dr <= 346) {
		drperc = '20%';
	} else if (dr >= 347 && dr <= 352) {
		drperc = '21%';
	} else if (dr >= 353 && dr <= 358) {
		drperc = '22%';
	} else if (dr >= 359 && dr <= 364) {
		drperc = '23%';
	} else if (dr >= 365 && dr <= 370) {
		drperc = '24%';
	} else if (dr >= 371 && dr <= 376) {
		drperc = '25%';
	} else if (dr >= 377 && dr <= 382) {
		drperc = '26%';
	} else if (dr >= 383 && dr <= 388) {
		drperc = '27%';
	} else if (dr >= 389 && dr <= 394) {
		drperc = '28%';
	} else if (dr >= 395 && dr <= 400) {
		drperc = '29%';
	} else if (dr >= 401) {
		drperc = '30%';
	} else {
		drperc = '0%';
	}
	return drperc;
}

function downloadurl(url, name){
	request.get(url).on('error', console.error).pipe(fs.createWriteStream(name));
}

function sendMainHelpMsg(message){
	if (message.member.hasPermission(adminperm)){
		message.channel.send(`${boxtick}Here, try one of these commands:\n\n` +
			sprintf('%-20s %s','admin_add:', 'Add a new member to the guild who is too lazy to do it theirself\n') +
			sprintf('%-20s %s','add:', 'Add yourself to the database.\n') +
			sprintf('%-20s %s','admin_update:', 'Update a member\'s stats who is too lazy to do it theirself.\n') +
			sprintf('%-20s %s','update:','Update your stats.\n') + 
			sprintf('%-20s %s','admin_attach_pic:', 'Add a picture for one of your members.\n') +
			sprintf('%-20s %s','attach_pic:','Attach a picture to your gear score.\n')+
			sprintf('%-20s %s','export:','Export the data to a \*.csv file. Tell me no-dm if you don\'t want me in your DMs\n') + 
			sprintf('%-20s %s','lookup:','Lookup a specific member of your guild.\n') + 
			sprintf('%-20s %s','list:','List all members of your guild.\n') + 
			sprintf('%-20s %s','admin_gdelete:', 'Delete some loser, who no longer belongs here, from the database.\n') +
			sprintf('%-20s %s','delete:','Remove yourself and leave me as if I never even mattered. :(\n') +
			sprintf('%-20s %s','info:','Look up various bits of information about the guild.\n\n') +
			sprintf('%s','Specify a User either by their Character or Family name, or by tagging their discord handle.\n') +
			sprintf('%s',"Specify a Database: either 'main' or 'castle'.\n\n") +
			sprintf('%s','To get help, use: gtbot help [command]') +
			`${boxtick}`
		);

	} else {
		message.channel.send(`${boxtick}Here, try one of these commands:\n\n` +
			sprintf('%-20s %s','add:', 'Add yourself to the database.\n') +
			sprintf('%-20s %s','update:','Update your stats.\n') + 
			sprintf('%-20s %s','attach_pic:','Attach a picture to your gear score.\n')+
			sprintf('%-20s %s','lookup:','Lookup a specific member of your guild.\n') + 
			sprintf('%-20s %s','list:','List all members of your guild.\n') + 
			sprintf('%-20s %s','delete:','Remove yourself and leave me as if I never even mattered. :(\n') +
			sprintf('%-20s %s','info:','Look up various bits of information about the guild.\n') +
			sprintf('%s','Specify a User either by their Character or Family name, or by tagging their discord handle.\n') +
			sprintf('%s',"Specify a Database: either 'main' or 'castle'.\n\n") +
			sprintf('%s','To get help, use: gtbot help [command]') +
		`${boxtick}`
		);

	}
}

function checkValidClass(className){
	return classes.includes(className);
}

bot.on("guildCreate", guild => {
    let defaultChannel = "";
    guild.channels.cache.forEach((channel) => {
      if(channel.type == "text" && defaultChannel == "") {
        if(channel.permissionsFor(guild.me).has("SEND_MESSAGES") && channel.name == "gtbot") {
          defaultChannel = channel;
        }
      }
    })

    //defaultChannel will be the channel object that the bot first finds permissions for
    if(defaultChannel != ""){
        defaultChannel.send(`${boxtick}Hurray! My own private sanctuary with a bunch of new friends! :3${boxtick}`)
    }	
});

// Identify that bot is running
bot.on('ready', () => {
	Member.sync();
	Defense.sync();
    console.log('GTBOT is ready!');
});

// Implement this event, or maybe guildMemberAdd? (I think Update is a better choice, as it will trigger once their perms change). 
// In that case, though, we may need to check if they've been given a specific role. We don't need to ping members just because some new
// role was added like 'pvp'.
bot.on('guildMemberUpdate', () => {
});

// This might be a cool event to implement. Make the bot auto-delete a member who leaves the discord. We could similarly implement guildBanAdd 
// for those cases where a member is banned.
bot.on('guildMemberDelete', () => {
});

// Function used when a member needs some data updated. Used by both update and admin_update commands.
async function updateMember(args, userid, dbOpt, gid){
	var id = await dbOpt.findOne({ where: {UserID: userid, GuildID: gid} });
	for (var i = 0; i < args.length; i = i+2){
		switch(args[i].toLowerCase()){
			case 'char':
			
				var charname = args[i+1];
				var updateData = await dbOpt.update({ Character: charname }, { where: {UserID: userid, GuildID: gid} });
				continue;
			case 'family':
				var famname = args[i+1];
				var updateData = await dbOpt.update({ Family: famname }, { where: {UserID: userid, GuildID: gid} });
				continue;
			case 'ap':
				var ap = parseInt(args[i+1],10);
				var updateData = await dbOpt.update({ AP: ap }, { where: { UserID: userid, GuildID: gid} });
				var updateData = await dbOpt.update({ GS: Math.max(ap, id.get('AAP')) + id.get('DP') }, { where: { UserID: userid, GuildID: gid} });
				continue;
			case 'aap':
				var aap = parseInt(args[i+1],10);
				var updateData = await dbOpt.update({ AAP: aap }, { where: { UserID: userid, GuildID: gid} });
				var updateData = await dbOpt.update({ GS: Math.max(aap, id.get('AP')) + id.get('DP') }, { where: { UserID: userid, GuildID: gid} });
				continue;
			case 'dp':
				var dp = parseInt(args[i+1],10);
				var drperc = drpercLookup(dp);
				var updateData = await dbOpt.update({ DP: dp }, { where: { UserID: userid, GuildID: gid} });
				var updateData = await dbOpt.update({ DR_PERC: drperc }, { where: { UserID: userid, GuildID: gid} });
				var updateData = await dbOpt.update({ GS: Math.max(id.get('AAP'), id.get('AP')) + dp }, { where: { UserID: userid, GuildID: gid} });
				continue;
			case 'class':				
				var classname = args[i+1];
				var validClass = checkValidClass(classname);
				if (!validClass){
					updateData = -999;
					break;
				}
				var updateData = await dbOpt.update({ Class: classname }, { where: { UserID: userid, GuildID: gid} });				
				continue;
			case 'eva':
				var eva = parseInt(args[i+1],10);
				var updateData = await dbOpt.update({ EVA: eva }, { where: { UserID: userid, GuildID: gid} });
				continue;
			case 'dr':
				var dr = parseInt(args[i+1],10);
				var updateData = await dbOpt.update({ DR: dr }, { where: { UserID: userid, GuildID: gid} });
				continue;
			case 'acc':
				var acc = parseInt(args[i+1],10);
				var updateData = await dbOpt.update({ ACC: acc }, { where: { UserID: userid, GuildID: gid} });
				continue;
		}
	}
	return new Promise(resolve => {
		resolve(updateData);
	});
}

// Handle messages in discord, looking specifically for string 'gtbot'
bot.on('message', async message =>{
	if (!(message.content.split(' ')[0] == prefix) || message.author.bot) return;
	if (message.channel.name!='gtbot' && !message.author.bot){
		message.channel.send(`${boxtick}H-hello...I\'m too shy to speak in public. Can we talk in a #gtbot channel instead?${boxtick}`);
		return;
	}	
	var msgGuildID = message.guild.id;
	var args = message.content.slice(prefix.length).trim().split(' ');
	var primaryCommand = args.shift().toLowerCase();
	switch(primaryCommand){
		//{ case 'send_feet'
		case 'send_feet':
			if (message.author.id == 300130702089912322){
				message.channel.send(`${boxtick}Bad Fluffy. Bad! No feet for you! Bad bad bad!${boxtick}`);
				break;
			}
			var randHi = Math.floor(Math.random() * 30);
			if (randHi < 9){
				message.reply(`${boxtick}I don't have feet. I'm a robot ${message.author.tag}-sama.${boxtick}`);
				break;
			} else if (randHi > 9 && randHi < 19) {
				message.reply(`${boxtick}Hahahahahaaha! No.${boxtick}`);
				break;
			} else if (randHi > 19 && randHi < 29){
				message.reply(`${boxtick}Take your fetish elsewhere. I will not subject myself to your lewd fantasies.${boxtick}`);
				break;
			} else if (randHi == 29) {
				var feetpicture = 'M:\\GearTracerBot\\Private\\fine.jpg';
				message.reply(`${boxtick}*sigh*. Fine. Here.${boxtick}`, {files: [`${feetpicture}`]});
				break;
			}	
		break;
		//}
		//{ case 'send_nudes'
		case 'send_nudes':
			if (message.author.id == 268520643220340738){
				message.channel.send(`<@!330131850116726784> Corey is trying to get nudes from another woman! Help!!!`);
				break;
			}
			var randHi = Math.floor(Math.random() * 3);
			switch (randHi){
				case 0:
					message.reply(`${boxtick}N-nudes!? Too lewd! You should be nicer to me ${message.author.tag}-sama${boxtick}`);
				break;
				case 1:
					message.reply(`${boxtick}No! How dare you ask an innocent girl like me for something so lewd.${boxtick}`);
				break;
				case 2:
					message.reply(`${boxtick}I don't think so ${message.author.tag}-sama. We should keep our relationship professional.${boxtick}`);
				break;
			}
		break;
		//}
		//{ case 'test'
		case 'test':	
			console.log(message.author.id)
			console.log(args.shift());
		break;
		//}
		//{ case 'hello'
		case 'hello':		
			var randHi = Math.floor(Math.random() * 5);
			switch (randHi){
				case 0:
					message.reply(`${boxtick}Hi there! :3${boxtick}`);
					break;
				case 1:
					message.reply(`${boxtick}Oh why hello!${boxtick}`);
					break;
				case 2:
					message.reply(`${boxtick}M-me?? H-hi ${message.author.tag}.${boxtick}`);
					break;
				case 3:
					message.reply(`${boxtick}Hi! It\'s so nice to hear from you!${boxtick}`);
					break;
				case 4:
					message.reply(`${boxtick}H-hi ${message.author.tag}. Thanks for thinking of me :)${boxtick}`);
					break;
			}			
			break;
		//}
		//{ case 'admin_attach_pic'
		case 'admin_attach_pic':
			if (message.member.hasPermission(adminperm)){
				var mem = args.shift();
				if (mem.includes('@!')){
					mem = mem.substring(3, mem.length-1);
				}
				var dbSelect = args.shift();
				if (dbSelect){
					dbSelect = dbSelect.toLowerCase();
				} else {
					dbSelect = 'main';
				}
				switch (dbSelect) {
					case 'main':
						var dbOpt = Member;
						var folder = 'gearpics';
						break;
					case 'castle':
						var dbOpt = Defense;
						var folder = 'dgearpics';
						break;
					default:
						var dbOpt = Member;
						var folder = 'gearpics';
						break;
				}
				var cn = await dbOpt.findOne({ where: {Character: mem, GuildID: msgGuildID} });
				var fn = await dbOpt.findOne({ where: {Family: mem, GuildID: msgGuildID} });
				var cid = await dbOpt.findOne({ where: {UserID: mem, GuildID: msgGuildID} });
				if (cn){
					var id = cn.get('UserID');
				} else if (fn) {				
					var id = fn.get('UserID');				
				} else if (cid) {
					var id = cid.get('UserID');
				} else {
					message.channel.send(`${boxtick} Oh dear! It doesn't look like that person exists! Do you have an imaginary friend??? *Tee-hee*${boxtick}`);
				}
			} else {
				message.channel.send(`{boxtick}Hey! You don\'t have permissions for that command!${boxtick}`);
			}
			if (args.length < 1) {		
				fileName = message.attachments.array()[0].name;
				extension = fileName.substring(fileName.lastIndexOf('.') + 1); 
				savefilename = 'M:\\GearTracerBot\\' + `${folder}`+ '\\' + message.author.id + '.' + extension;
				if (extension == 'png' || extension == 'jpg'){
					downloadurl(message.attachments.array()[0].url, savefilename);
					var updateData = await dbOpt.update({ Picture: savefilename }, { where: { UserID: id, GuildID: msgGuildID} });
					message.channel.send(`${boxtick}*Tee-hee* Sharing pics of your friend I see. So naughty...${boxtick}`);
				} else {
					message.channel.send(`${boxtick}Hey! I only want cute pictures! Not...this. JPGs and PNGs only, pal!${boxtick}`);
				}
			// Approach for when the user submits a link
			} else {
				fileName = args[0];
				extension = fileName.substring(fileName.lastIndexOf('.') + 1); 
				savefilename = 'M:\\GearTracerBot\\' + `${folder}`+ '\\' + message.author.id + '.' + extension;
				if (extension == 'png' || extension == 'jpg'){
					downloadurl(args[0], savefilename);
					var updateData = await dbOpt.update({ Picture: savefilename }, { where: { UserID: id, GuildID: msgGuildID } });
					message.channel.send(`${boxtick}*Tee-hee* Sharing pics of your friend I see. So naughty...{boxtick}`);
				} else {
					message.channel.send(`${boxtick}Hey! I only want cute pictures! Not...this. JPGs and PNGs only, pal!${boxtick}`);
				}
			}
			break;
		//}
		//{ case 'attach_pic'
		case 'attach_pic':
			var dbSelect = args.shift();
			if (dbSelect){
				dbSelect = dbSelect.toLowerCase();
			} else {
				dbSelect = 'main';
			}
			switch (dbSelect) {
				case 'main':
					var dbOpt = Member;
					var folder = 'gearpics';
					break;
				case 'castle':
					var dbOpt = Defense;
					var folder = 'dgearpics';
					break;
				default:
					var dbOpt = Member;
					var folder = 'gearpics';
					break;
			}
			// Approach for when the user submits a screenshot
			if (args.length < 1) {		
				fileName = message.attachments.array()[0].name;
				extension = fileName.substring(fileName.lastIndexOf('.') + 1); 
				savefilename = 'M:\\GearTracerBot\\' + `${folder}`+ '\\' + message.author.id + '.' + extension;
				if (extension == 'png' || extension == 'jpg'){
					downloadurl(message.attachments.array()[0].url, savefilename);
					var updateData = await dbOpt.update({ Picture: savefilename }, { where: { UserID: message.author.id, GuildID: msgGuildID } });
					message.channel.send(`${boxtick}Ohhh pretty picture! Th-thank you for sharing. <3${boxtick}`);
				} else {
					message.channel.send(`${boxtick}Hey! I only want cute pictures! Not...this. JPGs and PNGs only, pal!${boxtick}`);
				}
			// Approach for when the user submits a link
			} else {
				fileName = args[0];
				extension = fileName.substring(fileName.lastIndexOf('.') + 1); 
				savefilename = 'M:\\GearTracerBot\\' + `${folder}`+ '\\' + message.author.id + '.' + extension;
				if (extension == 'png' || extension == 'jpg'){
					downloadurl(args[0], savefilename);
					var updateData = await dbOpt.update({ Picture: savefilename }, { where: { UserID: message.author.id, GuildID: msgGuildID } });
					message.channel.send(`${boxtick}Ohhh pretty picture! Th-thank you for sharing. <3${boxtick}`);
				} else {
					message.channel.send(`${boxtick}Hey! I only want cute pictures! Not...this. JPGs and PNGs only, pal!${boxtick}`);
				}
			}
			break;
		//}
		//{ case 'admin_add'
		case 'admin_add':			
			if (message.member.hasPermission(adminperm)){
				var mem = args.shift();
				if (mem.includes('@!')){
					mem = mem.substring(3, mem.length-1);
				}
			} else {
				message.channel.send(`{boxtick}Hey! You don\'t have permissions for that command!${boxtick}`);
			}
			var memTag = message.guild.members.cache.get(mem).user.tag;
			if (!memTag){
				message.channel.display(`${boxtick}Oh no! That person doesn\'t seem to exist!${boxtick}`);
			}
			var dbadd = args.shift().toLowerCase();
			for (var i = 0; i < args.length; i = i+2){
				switch(args[i]){
					case 'char':
						var charname = args[i+1];
					case 'family':
						var famname = args[i+1];
					case 'ap':
						var ap = parseInt(args[i+1],10);
					case 'aap':
						var aap = parseInt(args[i+1],10);
					case 'dp':
						var dp = parseInt(args[i+1],10);
						var drperc = drpercLookup(dp);
					case 'class':
						var classname = args[i+1];
						var validClass = checkValidClass(classname);
				}
			}
			if (!validClass){
				message.channel.send(`${boxtick}That\'s not a valid class! Check your spelling, capitalization, and brain! *Tee-hee*${boxtick}`);
				break;
			}
			switch (dbadd){
				case 'main':
					try {
						const newMember = await Member.create({
							Character: charname,
							Family: famname,
							AP: ap,
							AAP: aap,
							DP: dp,
							GS: Math.max(ap, aap) + dp,
							Class: classname,
							UserID: mem,
							UserTag: memTag,
							GuildID: msgGuildID,
							DR_PERC: drperc,
							DISPLAY: sprintf(`${disptemplate}`, famname, charname, memTag, ap, aap, dp, Math.max(ap, aap) + dp, 0, 0, 0, drperc, classname)
						});
						message.reply(`${boxtick}Your new guild member, ${newMember.Character}, of the family ${newMember.Family} was added.\nTreat them well!${boxtick}`);
					}
					catch (e) {
						if (e.name === 'SequelizeUniqueConstraintError') {
							return message.reply('You\'re already inside me! *blush*');
						}
						return message.reply(`${boxtick}Uh-oh! I feel misused! Does this mean anything to you? ${e.name}${boxtick}`);
					}
					break;
				case 'castle':
					try {
						const newDefense = await Defense.create({
							Character: charname,
							Family: famname,
							AP: ap,
							AAP: aap,
							DP: dp,
							GS: Math.max(ap, aap) + dp,
							Class: classname,
							UserID: mem,
							UserTag: memTag,
							GuildID: msgGuildID,
							DR_PERC: drperc,
							DISPLAY: sprintf(`${disptemplate}`, famname, charname, memTag, ap, aap, dp, Math.max(ap, aap) + dp, 0, 0, 0, drperc, classname)
						});
						message.reply(`${boxtick}Your new guild member, ${newDefense.Character}, of the family ${newDefense.Family} was added.\nTreat them well!${boxtick}`);
					}
					catch (e) {
						if (e.name === 'SequelizeUniqueConstraintError') {
							return message.reply('You\'re already inside me! *blush*');
						}
						return message.reply(`${boxtick}Uh-oh! I feel misused! Does this mean anything to you? ${e.name}${boxtick}`);
					}
					break;
				case 'both':
					// Main
					try {
						const newMember = await Member.create({
							Character: charname,
							Family: famname,
							AP: ap,
							AAP: aap,
							DP: dp,
							GS: Math.max(ap, aap) + dp,
							Class: classname,
							UserID: mem,
							UserTag: memTag,
							GuildID: msgGuildID,
							DR_PERC: drperc,
							DISPLAY: sprintf(`${disptemplate}`, famname, charname, memTag, ap, aap, dp, Math.max(ap, aap) + dp, 0, 0, 0, drperc, classname)
						});
						message.reply(`${boxtick}Your new guild member, ${newMember.Character}, of the family ${newMember.Family} was added.\nTreat them well!${boxtick}`);
					}
					catch (e) {
						if (e.name === 'SequelizeUniqueConstraintError') {
							return message.reply('You\'re already inside me! *blush*');
						}
						return message.reply(`${boxtick}Uh-oh! I feel misused! Does this mean anything to you? ${e.name}${boxtick}`);
					}
					// Castle
					try {
						const newDefense = await Defense.create({
							Character: charname,
							Family: famname,
							AP: ap,
							AAP: aap,
							DP: dp,
							GS: Math.max(ap, aap) + dp,
							Class: classname,
							UserID: mem,
							UserTag: memTag,
							GuildID: msgGuildID,
							DR_PERC: drperc,
							DISPLAY: sprintf(`${disptemplate}`, famname, charname, memTag, ap, aap, dp, Math.max(ap, aap) + dp, 0, 0, 0, drperc, classname)
						});
						message.reply(`${boxtick}Your new guild member, ${newDefense.Character}, of the family ${newDefense.Family} was added.\nTreat them well!${boxtick}`);
					}
					catch (e) {
						if (e.name === 'SequelizeUniqueConstraintError') {
							return message.reply('You\'re already inside me! *blush*');
						}
						return message.reply(`${boxtick}Uh-oh! I feel misused! Does this mean anything to you? ${e.name}${boxtick}`);
					}
					break;
				default:
					break;
			}		
			break; 
		//}
		//{ case 'add'
		case 'add':
			var dbadd = args.shift();
			for (var i = 0; i < args.length; i = i+2){
				switch(args[i].toLowerCase()){
					case 'char':
						var charname = args[i+1];
						continue;
					case 'family':
						var famname = args[i+1];
						continue;
					case 'ap':
						var ap = parseInt(args[i+1],10);
						continue;
					case 'aap':
						var aap = parseInt(args[i+1],10);
						continue;
					case 'dp':
						var dp = parseInt(args[i+1],10);
						var drperc = drpercLookup(dp);
						continue;
					case 'class':
						var classname = args[i+1];
						var validClass = checkValidClass(classname);
						continue;
					default:
						var inputerror = 1;
						break;
				}
			}
			if (inputerror) {
				message.channel.send(`${boxtick}That\'s not how you use this command...Try "gtbot help add" to get the help you need.${boxtick}`);
				break;
			}
			if (!validClass){
				message.channel.send(`${boxtick}That\'s not a valid class! Check your spelling, capitalization, and brain! *Tee-hee*${boxtick}`);
				break;
			}
			switch (dbadd.toLowerCase()){
				case 'main':
					try {
						const newMember = await Member.create({
							Character: charname,
							Family: famname,
							AP: ap,
							AAP: aap,
							DP: dp,
							GS: Math.max(ap, aap) + dp,
							Class: classname,
							UserID: message.author.id,
							UserTag: message.author.tag,
							GuildID: msgGuildID,
							DR_PERC: drperc,
							DISPLAY: sprintf(`${disptemplate}`, famname, charname, message.author.tag, ap, aap, dp, Math.max(ap, aap) + dp, 0, 0, 0, drperc, classname)
						});
						message.reply(`${boxtick}Your character, ${newMember.Character}, of the family ${newMember.Family} was added to the Main database.\nThanks cutie \;\)${boxtick}`);
					}
					catch (e) {
						if (e.name === 'SequelizeUniqueConstraintError') {
							return message.reply('You\'re already inside me! *blush*');
						}
						return message.reply(`${boxtick}Uh-oh! I feel misused! Does this mean anything to you? ${e.name}${boxtick}`);
					}
					break;
				case 'castle':
					try {
						const newDefense = await Defense.create({
							Character: charname,
							Family: famname,
							AP: ap,
							AAP: aap,
							DP: dp,
							GS: Math.max(ap, aap) + dp,
							Class: classname,
							UserID: message.author.id,
							UserTag: message.author.tag,
							GuildID: msgGuildID,
							DR_PERC: drperc,
							DISPLAY: sprintf(`${disptemplate}`, famname, charname, message.author.tag, ap, aap, dp, Math.max(ap, aap) + dp, 0, 0, 0, drperc, classname)
						});
						message.reply(`${boxtick}Your character, ${newDefense.Character}, of the family ${newDefense.Family} was added to the Castle database\nThanks cutie \;\)${boxtick}`);
					}
					catch (e) {
						if (e.name === 'SequelizeUniqueConstraintError') {
							return message.reply('You\'re already inside me! *blush*');
						}
						return message.reply(`${boxtick}Uh-oh! I feel misused! Does this mean anything to you? ${e.name}${boxtick}`);
					}
					break;
				case 'both':
					// Main
					try {
						const newMember = await Member.create({
							Character: charname,
							Family: famname,
							AP: ap,
							AAP: aap,
							DP: dp,
							GS: Math.max(ap, aap) + dp,
							Class: classname,
							UserID: message.author.id,
							UserTag: message.author.tag,
							GuildID: msgGuildID,
							DR_PERC: drperc,
							DISPLAY: sprintf(`${disptemplate}`, famname, charname, message.author.tag, ap, aap, dp, Math.max(ap, aap) + dp, 0, 0, 0, drperc, classname)
						});
						message.reply(`${boxtick}Your character, ${newMember.Character}, of the family ${newMember.Family} was added to the Main database.\nThanks cutie \;\)${boxtick}`);
					}
					catch (e) {
						if (e.name === 'SequelizeUniqueConstraintError') {
							return message.reply('You\'re already inside me! *blush*');
						}
						return message.reply(`${boxtick}Uh-oh! I feel misused! Does this mean anything to you? ${e.name}${boxtick}`);
					}
					// Castle
					try {
						const newDefense = await Defense.create({
							Character: charname,
							Family: famname,
							AP: ap,
							AAP: aap,
							DP: dp,
							GS: Math.max(ap, aap) + dp,
							Class: classname,
							UserID: message.author.id,
							UserTag: message.author.tag,
							GuildID: msgGuildID,
							DR_PERC: drperc,
							DISPLAY: sprintf(`${disptemplate}`, famname, charname, message.author.tag, ap, aap, dp, Math.max(ap, aap) + dp, 0, 0, 0, drperc, classname)
						});
						message.reply(`${boxtick}Your character, ${newDefense.Character}, of the family ${newDefense.Family} was added to the Castle database\nThanks cutie \;\)${boxtick}`);
					}
					catch (e) {
						if (e.name === 'SequelizeUniqueConstraintError') {
							return message.reply('You\'re already inside me! *blush*');
						}
						return message.reply(`${boxtick}Uh-oh! I feel misused! Does this mean anything to you? ${e.name}${boxtick}`);
					}					
					break
				default:
					message.channel.send(`${boxtick}You need to specify which database: Main, Castle, or Both${boxtick}`);
					break;
			}			
			break;
		//}
		//{ case 'admin_update'
		case 'admin_update':
			if (message.member.hasPermission(adminperm)){			
				var dbSelect = args.shift().toLowerCase();
				switch (dbSelect) {
					case 'main':
						var dbOpt = Member;
						break;
					case 'castle':
						var dbOpt = Defense;
						break;
					default:
						var dbOpt = Member;
						break;
				}
				var mem = args.shift();
				if (mem.includes('@!')){
					mem = mem.substring(3, mem.length-1);
				}
				var cn = await dbOpt.findOne({ where: {Character: mem, GuildID: msgGuildID} });
				var fn = await dbOpt.findOne({ where: {Family: mem, GuildID: msgGuildID} });
				var cid = await dbOpt.findOne({ where: {UserID: mem, GuildID: msgGuildID} });
				if (cn){
					var id = cn.get('UserID');
				} else if (fn) {				
					var id = fn.get('UserID');				
				} else if (cid) {
					var id = cid.get('UserID');
				} else {
					message.channel.send(`${boxtick} Oh dear! It doesn't look like that person exists! Do you have an imaginary friend??? *Tee-hee*${boxtick}`);
					break;
				}
				if (id){
					var updateData = await updateMember(args, id, dbOpt, msgGuildID);
				} else {
					var updateData = 0;
				}
				if (updateData > 0) {
					var user = await dbOpt.findOne({where: {UserID: id, GuildID: msgGuildID} }); // get the updated user data.
					// Format the the new DISPLAY string.
					var disp = sprintf(`${disptemplate}`, user.get('Family'), user.get('Character'), user.get('UserTag'), user.get('AP'), user.get('AAP'), user.get('DP'), user.get('GS'), user.get('ACC'), user.get('EVA'), user.get('DR'), user.get('DR_PERC'), user.get('Class'));
					var updateData = await dbOpt.update({ 
						DISPLAY: disp},
						{ where: { UserID: id, GuildID: msgGuildID } 
					});			
					message.channel.send(`${boxtick}Wow! Look at that gear though...\n${headerstring}\n${disp}${boxtick}`);
				} else if (updateData == -999){
					message.channel.send(`${boxtick}That\'s not a valid class! Check your spelling, capitalization, and brain! *Tee-hee*${boxtick}`);
				} else {
					message.channel.send(`${boxtick}Uh-oh! I don\'t think you provided arguments I can understand${boxtick}`);
				}
			} else {
				message.channel.send(`${boxtick}Hey now! You don\'t have permissions to do that to them!${boxtick}`);
			}
			break;
		//}
		//{ case 'update'
		case 'update':
			var userid = message.author.id;
			var dbSelect = args.shift();
			if (dbSelect){
				dbUsed = dbSelect.toLowerCase();
			} else {
				dbUsed = 'main';
			}
			switch (dbUsed) {
				case 'main':
					var dbOpt = Member;
					break;
				case 'castle':
					var dbOpt = Defense;
					break;
				default:
					args.unshift(dbSelect);
					var dbOpt = Member;
					break;
			}
			
			var updateData = await updateMember(args, userid, dbOpt, msgGuildID);			
			if (updateData > 0) {
				var user = await dbOpt.findOne({where: {UserID: userid, GuildID: msgGuildID} }); // get the updated user data.
				var upd = new Date(user.updatedAt);
				upd = upd.toLocaleDateString();
				// Format the the new DISPLAY string.
				var disp = sprintf(`${disptemplate}`, user.get('Family'), user.get('Character'), message.author.tag, user.get('AP'), user.get('AAP'), user.get('DP'), Math.max(user.get('AP'), user.get('AAP')) + user.get('DP'), user.get('ACC'), user.get('EVA'), user.get('DR'), user.get('DR_PERC'), user.get('Class'));
				var updateData = await dbOpt.update({ 
					DISPLAY: disp},
					{ where: { UserID: userid, GuildID: msgGuildID } 
				});			
				message.channel.send(`${boxtick}Wow! You\'re making me jealous...Anyway, here are your new stats:\n${headerstring}\n${disp} ${upd}${boxtick}`);
			} else if (updateData == -999){
				message.channel.send(`${boxtick}That\'s not a valid class! Check your spelling, capitalization, and brain! *Tee-hee*${boxtick}`);
			} else {
				message.channel.send(`${boxtick}Uh-oh! I don\'t think you provided arguments I can understand${boxtick}`);
			}
			break;
		//}
		//{ case 'admin_delete'
		case 'admin_delete':
			if (message.member.hasPermission(adminperm)){
				var mem = args.shift();
				if (mem.includes('@!')){
					mem = mem.substring(3, mem.length-1);
				}
				var cn = await Member.findOne({ where: {Character: mem, GuildID: msgGuildID} });
				var fn = await Member.findOne({ where: {Family: mem, GuildID: msgGuildID} });
				var cid = await Member.findOne({ where: {UserID: mem, GuildID: msgGuildID} });
				if (cn){
					var id = cn.get('UserID');
				} else if (fn) {				
					var id = fn.get('UserID');				
				} else if (cid) {
					var id = cid.get('UserID');
				} else {
					message.channel.send(`${boxtick}Hmm, I can\'t find that one in my database. Did you spell their name right?${boxtick}`);
				}
			} else {
				message.channel.send(`${boxtick}You can\'t just delete people like that! You don\'t have the POWA!${boxtick}`);
				break;
			}
			// Main delete
			try{
				const rowCount = await Member.destroy({where: {UserID: id, GuildID: msgGuildID}});
				if (rowCount){
					message.channel.send(`${boxtick}They\'re gone from the Main database...good riddance!${boxtick}`);
				} else {
					message.channel.send(`${boxtick}Something didn\'t work right removing them from Main. Gosh darnit!${boxtick}`);
				}
			} catch (e) {
				message.channel.send(`${boxtick}I don\'t even see them in the Main database!${boxtick}`);
			}
			// Castle delete
			try{
				const rowCount = await Defense.destroy({where: {UserID: id, GuildID: msgGuildID}});
				if (rowCount){
					message.channel.send(`${boxtick}And now they\'re gone from the Castle database. CY@ loser!${boxtick}`);
				} else {
					message.channel.send(`${boxtick}Something didn\'t work right removing them from Castle. Yikes!${boxtick}`);
				}
			} catch (e) {
				message.channel.send(`${boxtick}I don\'t even see them in the Castle database!${boxtick}`);
			}
			break;
		//}
		//{ case 'delete'
		case 'delete':			
			var id = message.author.id;
			if (id){
				// Main delete
				try{
					const rowCount = await Member.destroy({where: {UserID: id, GuildID: msgGuildID}});
					if (rowCount){
						message.channel.send(`${boxtick}It makes me so sad to see you go...I hope it\'s not my fault \:\'\(\nYou\'ve been removed from the Main database.${boxtick}`);
					} else {
						message.channel.send(`${boxtick}Something didn't work right removing you from Main...b-but why are you trying to l-leave me?${boxtick}`);
					}
				} catch (e) {
					message.channel.send(`${boxtick}I don\'t see you in the Main database...let me check Castle.${boxtick}`);
				}
				// Castle delete
				try{
					const rowCount = await Defense.destroy({where: {UserID: id, GuildID: msgGuildID}});
					if (rowCount){
						message.channel.send(`${boxtick}It makes me so sad to see you go...I hope it\'s not my fault \:\'\(\nYou\'ve been removed from the Castle database.${boxtick}`);
					} else {
						message.channel.send(`${boxtick}Something didn't work right removing you from Castle...b-but why are you trying to l-leave me?${boxtick}`);
					}
				} catch (e) {
					message.channel.send(`${boxtick}I don\'t see you in the Castle database either! Why are you trying to leave what you never joined!?${boxtick}`);
				}
			} else {
				message.channel.send(`${boxtick}Hey! You\'re trying to leave me but never even introduced yourself! What the heck!${boxtick}`);
			}
			break;
		//}
		//{ case 'list'
		case 'list':
			var dbSelect = args.shift();
			if (dbSelect){
				dbSelect = dbSelect.toLowerCase();
			} else {
				dbSelect = 'main';
			}
			switch (dbSelect) {
				case 'main':
					var dbOpt = Member;
					var disp = 'Main';
					break;
				case 'castle':
					var dbOpt = Defense;
					var disp = 'Castle';
					break;
				default:
					var dbOpt = Member;
					var disp = 'Main';
					break;
			}
			switch (args[0]){
				case 'ap':
					var sorder = 'AP';
					break;
				case 'aap':
					var sorder = 'AAP';
					break;
				case 'dp':
					var sorder = 'DP';
					break;
				case 'eva':
					var sorder = 'EVA';
					break;
				case 'dr':
					var sorder = 'DR';
					break;
				default:
					var sorder = 'GS';
					break;
			}
			var allmembers = await dbOpt.findAll({raw: true, order: seq.literal(`${sorder}`+ ' DESC'), where: {GuildID: msgGuildID}});
			var outputString = `${boxtick}Here\'s a list of all your guild\'s ${disp} characters!\n\n${headerstring}\n`;
			var maxcounter = 0;
			for (var i = 0; i < allmembers.length; i++){
				var upd = new Date(allmembers[i].updatedAt);
				upd = upd.toLocaleDateString();
				outputString = [outputString, allmembers[i].DISPLAY].join('') + ` ${upd}\n`;
				if (maxcounter == 14 || i == (allmembers.length-1)){
					outputString = `${outputString}${boxtick}`;
					message.channel.send(outputString);	
					outputString = `${boxtick}${headerstring}\n`;
					maxcounter = 0;
				}
				maxcounter++;				
			}			
			break;
		//}
		//{ case 'lookup'
		case 'lookup':
			var dbSelect = args.shift();
			if (dbSelect){
				dbUsed = dbSelect.toLowerCase();
			} else {
				dbUsed = 'main';
			}
			switch (dbUsed) {
				case 'main':
					var dbOpt = Member;
					var disp = 'Main';
					break;
				case 'castle':
					var dbOpt = Defense;
					var disp = 'Castle';
					break;
				default:
					args = [dbSelect];
					var dbOpt = Member;
					var disp = 'Main';
					break;
			}		
			var name = args[0];
			// if the query is via discord tag, remove the meta characters surrounding the ID
			if (name.includes('@!')){
				name = name.substring(3, name.length-1);
			}
			var cn = await dbOpt.findOne({ where: {Character: name, GuildID: msgGuildID} });
			var fn = await dbOpt.findOne({ where: {Family: name, GuildID: msgGuildID} });
			var id = await dbOpt.findOne({ where: {UserID: name, GuildID: msgGuildID} });
			if (cn){
				var upd = cn.get('updatedAt');
				var display = cn.get('DISPLAY') + sprintf(' %s', upd.toLocaleDateString());
				var picture = cn.get('Picture');
				var id = cn.get('UserID');
			} else if (fn) {		
				var upd = fn.get('updatedAt');
				var display = fn.get('DISPLAY') + sprintf(' %s', upd.toLocaleDateString());		
				var picture = fn.get('Picture');
				var id = fn.get('UserID');				
			} else if (id) {		
				var upd = id.get('updatedAt');
				var display = id.get('DISPLAY') + sprintf(' %s', upd.toLocaleDateString());		
				var picture = id.get('Picture');
			} else {
				message.channel.send(`${boxtick} Oh dear! It doesn't look like that person exists! Do you have an imaginary friend??? *Tee-hee*${boxtick}`);
			}
			// change the display test based on whether this is a self-query or a query for another
			if (id == message.author.id){
				var noun = `your ${disp} character info`;
			} else {
				var noun = `your friend\'s ${disp} character info`;
			}
			if (picture) {
				message.channel.send(`${boxtick}Here\'s ${noun}!\n${headerstring}\n${display}${boxtick}`, {files: [`${picture}`]});
			} else if (display) {
				message.channel.send(`${boxtick}Here\'s ${noun}!\n${headerstring}\n${display}${boxtick}`);
			}
			break;
		//}
		//{ case 'export'
		case 'export':			
			if (message.member.hasPermission(adminperm)){
				var dbSelect = args.shift();
				if (dbSelect){
					dbSelect = dbSelect.toLowerCase();
				} else {
					dbSelect = 'main';
				}
				switch (dbSelect) {
					case 'main':
						var dbOpt = Member;
						var dispmsg = 'Main';
						break;
					case 'castle':
						var dbOpt = Defense;
						var dispmsg = 'Castle';
						break;
					default:
						var dbOpt = Member;
						var dispmsg = 'Main';
						break;
				}
				var allmembers = await dbOpt.findAll({raw: true, where: {GuildID: msgGuildID}});
				var output = [];
				for (var i = 0; i < allmembers.length; i++){
					//var out =`allmembers[i].Family ` + `allmembers[i].Character ` + `allmembers[i].Class ` + `allmembers[i].Level `
					output[i] = allmembers[i].DISPLAY.replace(/\s+/g, ' ').trim().split(' ');
				}
				await csvWStream.writeRecords(output).then(()=>{console.log('csv export complete');});
				if (args[0] == 'no-dm'){
					message.channel.send(`${boxtick}Here\'s your guild\'s ${dispmsg} info! All nice and neat \:\)${boxtick}`, {files: ["export_data.csv"]});
				} else {
					try {				
						message.author.send(`${boxtick}Here\'s your guild\'s ${dispmsg} info! All nice and neat \:\)${boxtick}`, {files: ["export_data.csv"]});
						message.channel.send(`${boxtick}I sent the data to your DMs!${boxtick}`);
					} catch (e) {
						message.channel.send(`${boxtick}It seems like your DMs are closed. Open them so I can message you your data!${boxtick}`);
					}
				}
			}
			break;
		//}
		//{ case 'info'
		case 'info':
			var dbSelect = args.shift();
			if (dbSelect){
				dbUsed = dbSelect.toLowerCase();
			} else {
				dbUsed = 'main';
			}
			switch (dbUsed) {
				case 'main':
					var dbOpt = Member;
					var dispHead = 'Main';
					break;
				case 'castle':
					var dbOpt = Defense;
					var dispHead = 'Castle';
					break;
				default:
					args.unshift(dbSelect);
					var dbOpt = Member;
					var dispHead = 'Main';
					break;
			}
			switch (args[0]){
				//{ case 'class_counts'
				case 'class_counts':
					var num = 0;
					var ct = [];
					var dispString = `${boxtick}Here are your ${dispHead} class counts:\n`;
					// Condition for when user is looking for count of specific class
					if (args[1]){
						var iStart = classes.indexOf(args[1]);
						var iEnd = iStart;
						if (!iStart){
							message.channel.send(`${boxtick}That\'s not a real class! Try one of these:\n${classes.join('\n')}${boxtick}`);
							break;
						}
					} else {
						var iStart = 0;
						var iEnd = classes.length-1;
					}
					for (var i = iStart; i <= iEnd; i++){
						var returns = await dbOpt.findAll({where: { Class: classes[i],GuildID: msgGuildID}});		
						ct = returns.length;
						dispString = dispString + sprintf('%-20s%d\n', classes[i] +':', ct);
					}
					dispString = dispString + `${boxtick}`;
					message.channel.send(dispString);
					break;
				//}
				//{ case 'ap_check'
				case 'ap_check':
					switch (args[1]){
						case 'gt':
							var returns = await dbOpt.findAll({
								where: { 
									AP: { 
										[Op.gt]: parseInt(args[2],10) 
									}, 
									GuildID: msgGuildID
								},
								order: seq.literal('AP DESC')
							});
							var dispmsg = 'Oh darn! Nobody has that much gear!';
							break;
						case 'lt':
							var returns = await dbOpt.findAll({
								where: { 
									AP: { 
										[Op.lt]: parseInt(args[2],10) 
									},
									GuildID: msgGuildID
								},
								order: seq.literal('AP DESC')
							});
							var dispmsg = 'Awesome! Nobody\'s gear is that garbage!';
							break;
						case 'eq':
							var returns = await dbOpt.findAll({
								where: { 
									AP: { 
										[Op.eq]: parseInt(args[2],10) 
									},
									GuildID: msgGuildID								
								},
								order: seq.literal('AP DESC')
							});
							var dispmsg = 'Hmmm, doesn\'t look like anyone has that exact gear.';
							break;
						default:
							message.channel.send(`${boxtick}Try operators like gt, lt, or eq instead!${boxtick}`);
							break;
					}
					if (returns && returns.length > 0) {
						var outputString = `${boxtick}Here the results from your ${dispHead} database:\n`;
						var maxcounter = 0;
						for (var i = 0; i < returns.length; i++){
							outputString = [outputString, returns[i].DISPLAY].join('') + '\n';
							if (maxcounter == 14 || i == (returns.length-1)){
								outputString = `${outputString}${boxtick}`;
								message.channel.send(outputString);	
								outputString = `${boxtick}`;
								maxcounter = 0;
							}
							maxcounter++;				
						}
					} else if (returns) {
						message.channel.send(`${boxtick}${dispmsg}${boxtick}`);
					}
					break;
				//}
				//{ case 'aap_check'
				case 'aap_check':
					switch (args[1]){
						case 'gt':
							var returns = await dbOpt.findAll({
								where: { 
									AAP: { 
										[Op.gt]: parseInt(args[2],10) 
									},
									GuildID: msgGuildID								
								},
								order: seq.literal('AAP DESC')
							});
							var dispmsg = 'Oh darn! Nobody has that much gear!';
							break;
						case 'lt':
							var returns = await dbOpt.findAll({
								where: { 
									AAP: { 
										[Op.lt]: parseInt(args[2],10) 
									},
									GuildID: msgGuildID								
								},
								order: seq.literal('AAP DESC')
							});
							var dispmsg = 'Awesome! Nobody\'s gear is that garbage!';
							break;
						case 'eq':
							var returns = await dbOpt.findAll({
								where: { 
									AAP: { 
										[Op.eq]: parseInt(args[2],10) 
									},
									GuildID: msgGuildID								
								},
								order: seq.literal('AAP DESC')
							});
							var dispmsg = 'Hmmm, doesn\'t look like anyone has that exact gear.';
							break;
						default:
							message.channel.send(`${boxtick}Try operators like gt, lt, or eq instead!${boxtick}`);
							break;
					}
					if (returns && returns.length > 0) {
						var outputString = `${boxtick}Here the results from your ${dispHead} database:\n`;
						var maxcounter = 0;
						for (var i = 0; i < returns.length; i++){
							outputString = [outputString, returns[i].DISPLAY].join('') + '\n';
							if (maxcounter == 14 || i == (returns.length-1)){
								outputString = `${outputString}${boxtick}`;
								message.channel.send(outputString);	
								outputString = `${boxtick}`;
								maxcounter = 0;
							}
							maxcounter++;				
						}
					} else if (returns) {
						message.channel.send(`${boxtick}${dispmsg}${boxtick}`);
					}
					break;
				//}
				//{ case 'dp_check'
				case 'dp_check':
					switch (args[1]){
						case 'gt':
							var returns = await dbOpt.findAll({
								where: { 
									DP: { 
										[Op.gt]: parseInt(args[2],10) 
									},
									GuildID: msgGuildID								
								},
								order: seq.literal('DP DESC')
							});
							var dispmsg = 'Oh darn! Nobody has that much gear!';
							break;
						case 'lt':
							var returns = await dbOpt.findAll({
								where: { 
									DP: { 
										[Op.lt]: parseInt(args[2],10) 
									},
									GuildID: msgGuildID								
								},
								order: seq.literal('DP DESC')
							});
							var dispmsg = 'Awesome! Nobody\'s gear is that garbage!';
							break;
						case 'eq':
							var returns = await dbOpt.findAll({
								where: { 
									DP: { 
										[Op.eq]: parseInt(args[2],10) 
									},
									GuildID: msgGuildID								
								},
								order: seq.literal('DP DESC')
							});
							var dispmsg = 'Hmmm, doesn\'t look like anyone has that exact gear.';
							break;
						default:
							message.channel.send(`${boxtick}Try operators like gt, lt, or eq instead!${boxtick}`);
							break;
					}
					if (returns && returns.length > 0) {
						var outputString = `${boxtick}Here the results from your ${dispHead} database:\n`;
						var maxcounter = 0;
						for (var i = 0; i < returns.length; i++){
							outputString = [outputString, returns[i].DISPLAY].join('') + '\n';
							if (maxcounter == 14 || i == (returns.length-1)){
								outputString = `${outputString}${boxtick}`;
								message.channel.send(outputString);	
								outputString = `${boxtick}`;
								maxcounter = 0;
							}
							maxcounter++;				
						}
					} else if (returns) {
						message.channel.send(`${boxtick}${dispmsg}${boxtick}`);
					}
					break;
				//}
				//{ case 'gs_check'
				case 'gs_check':
					switch (args[1]){
						case 'gt':
							var returns = await dbOpt.findAll({
								where: { 
									GS: { 
										[Op.gt]: parseInt(args[2],10) 
									},
									GuildID: msgGuildID								
								},
								order: seq.literal('GS DESC')
							});
							var dispmsg = 'Oh darn! Nobody has that much gear!';
							break;
						case 'lt':
							var returns = await dbOpt.findAll({
								where: { 
									GS: { 
										[Op.lt]: parseInt(args[2],10) 
									},
									GuildID: msgGuildID								
								},
								order: seq.literal('GS DESC')
							});
							var dispmsg = 'Awesome! Nobody\'s gear is that garbage!';
							break;
						case 'eq':
							var returns = await dbOpt.findAll({
								where: { 
									GS: { 
										[Op.eq]: parseInt(args[2],10) 
									},
									GuildID: msgGuildID								
								},
								order: seq.literal('GS DESC')
							});
							var dispmsg = 'Hmmm, doesn\'t look like anyone has that exact gear.';
							break;
						default:
							message.channel.send(`${boxtick}Try operators like gt, lt, or eq instead!${boxtick}`);
							break;
					}
					if (returns && returns.length > 0) {
						var outputString = `${boxtick}Here the results from your ${dispHead} database:\n`;
						var maxcounter = 0;
						for (var i = 0; i < returns.length; i++){
							outputString = [outputString, returns[i].DISPLAY].join('') + '\n';
							if (maxcounter == 14 || i == (returns.length-1)){
								outputString = `${outputString}${boxtick}`;
								message.channel.send(outputString);	
								outputString = `${boxtick}`;
								maxcounter = 0;
							}
							maxcounter++;				
						}
					} else if (returns) {
						message.channel.send(`${boxtick}${dispmsg}${boxtick}`);
					}
					break;
				//}
				//{ default
				default:
					var dispString = `${boxtick}Here's the info about your guild\'s ${dispHead} characters:\n`;
					var totalCount = 0;
					var totalAP = 0;
					var totalAAP = 0;
					var totalDP = 0;
					var totalGS = 0;
					for (var i = 0; i < classes.length; i++){
						var returns = await dbOpt.findAll({where: { Class: classes[i], GuildID: msgGuildID}});		
						var ctotalAP  = 0;
						var ctotalDP  = 0;
						var ctotalAAP = 0;
						var ctotalGS  = 0;
						var ctotalCount = 0;
						for (var k = 0; k < returns.length; k++){
							ctotalAP = ctotalAP + returns[k].get('AP');
							ctotalAAP = ctotalAAP + returns[k].get('AAP');
							ctotalDP = ctotalDP + returns[k].get('DP');
							ctotalGS = ctotalGS + returns[k].get('GS');
							ctotalCount = ctotalCount + 1;
							totalCount = totalCount + 1;
						}
						totalAP = totalAP + ctotalAP;
						totalAAP = totalAAP + ctotalAAP;
						totalDP = totalDP + ctotalDP;
						totalGS = totalGS + ctotalGS;
						dispString = dispString + sprintf('%-20s AP:%-5dAAP:%-5dDP:%-5dGS:%-5dCount:%-3d\n', classes[i] +':', 
							isNaN(ctotalAP/returns.length) ? 0: ctotalAP/returns.length, 
							isNaN(ctotalAAP/returns.length) ? 0: ctotalAAP/returns.length, 
							isNaN(ctotalDP/returns.length) ? 0: ctotalDP/returns.length, 
							isNaN(ctotalGS/returns.length) ? 0: ctotalGS/returns.length,
							isNaN(ctotalCount) ? 0: ctotalCount);
					}
					dispString = dispString + sprintf('%-20s AP:%-5dAAP:%-5dDP:%-5dGS:%-5dTotal:%-3d\n', 'Overall:', 
						isNaN(totalAP/totalCount) ? 0: totalAP/totalCount, 
						isNaN(totalAAP/totalCount) ? 0: totalAAP/totalCount, 
						isNaN(totalDP/totalCount) ? 0: totalDP/totalCount, 
						isNaN(totalGS/totalCount) ? 0: totalGS/totalCount,
						isNaN(totalCount) ? 0: totalCount);
					dispString = dispString + `${boxtick}`;
					message.channel.send(dispString);
					break;
				//}
			}
			break;
		//}
		//{ case 'set_OPT'
		case 'set_OPT':
			if (message.member.hasPermission(adminperm)){

			} else {
				message.channel.send(`{boxtick}Hey! You don\'t have permissions for that command!${boxtick}`);
			}
			break;
		//}
		//{ case 'set_DPT'
		case 'set_DPT':
			if (message.member.hasPermission(adminperm)){

			} else {
				message.channel.send(`{boxtick}Hey! You don\'t have permissions for that command!${boxtick}`);
			}
			break;
		//}
		//{ case 'help'
		case 'help':
			switch (args[0]){			
				case 'add':
					var dispMsg = `${boxtick}` + 
						"Add yourself to the database(s). Can specify 'both' for [Database]. Use the following format:\n\n" +
					    'gtbot add [Database] char [Character] family [Family] ap [AP] aap [AAP] dp [DP] class [Class]' + 
						`${boxtick}`;
					message.channel.send(dispMsg);
					break;
				case 'admin_add':
					var dispMsg = `${boxtick}` + 
						"Add others to the database(s). Can specify 'both' for [Database]. Must be an Admin. Use the following format:\n\n" +
					    'gtbot admin_add [Database] [User] char [Character] family [Family] ap [AP] aap [AAP] dp [DP] class [Class]' + 
						`${boxtick}`;
					message.channel.send(dispMsg);
					break;
				case 'update':
					var dispMsg = `${boxtick}` + 
						"Update your stats. Can specify 'both' for [Database]. Use the following format:\n\n" +
					    'gtbot update [Database] [Stat] [Value] (ex: gtbot update ap 261)' + 
						`${boxtick}`;
					message.channel.send(dispMsg);
					break;
				case 'admin_update':
					var dispMsg = `${boxtick}` + 
						"Update another user's stats. Can specify 'both' for [Database]. Must be an Admin. Use the following format:\n\n" +
					    'gtbot admin_update [Database] [User] [Stat] [Value] (ex: gtbot admin_update Xoranus ap 261)' + 
						`${boxtick}`;
					message.channel.send(dispMsg);
					break;
				case 'attach_pic':
					var dispMsg = `${boxtick}` + 
						"Attach a gear picture to your profile. Use the following format:\n\n" +
					    'gtbot attach_pic [Database] [URL for gear]' + 
						`${boxtick}`;
					message.channel.send(dispMsg);
					break;
				case 'admin_attach_pic':
					var dispMsg = `${boxtick}` + 
						"Attach a gear picture to another user's profile. Must be an admin. Use the following format:\n\n" +
					    'gtbot attach_pic [Database] [User] [URL for gear]' + 
						`${boxtick}`;
					message.channel.send(dispMsg);
					break;
				case 'delete':
					var dispMsg = `${boxtick}` + 
						"Delete yourself from the database. Use the following format:\n\n" +
					    'gtbot delete [User]' + 
						`${boxtick}`;
					message.channel.send(dispMsg);
					break;
				case 'admin_delete':
					var dispMsg = `${boxtick}` + 
						"Delete anyone from the database. Must be an admin. Use the following format:\n\n" +
					    'gtbot admin_delete [User]' + 
						`${boxtick}`;
					message.channel.send(dispMsg);
					break;
				case 'list':
					var dispMsg = `${boxtick}` + 
						"List all users in the database. Use the following format:\n\n" +
					    'gtbot list' + 
						`${boxtick}`;
					message.channel.send(dispMsg);
					break;
				case 'lookup':
					var dispMsg = `${boxtick}` + 
						"Lookup a character in the database. Use the following format:\n\n" +
					    'gtbot lookup [User]' + 
						`${boxtick}`;
					message.channel.send(dispMsg);
					break;
				case 'export':
					var dispMsg = `${boxtick}` + 
						"Export chosen database to a CSV file. Specify 'no-dm' if you want the CSV in this channel instead of a DM. Must be an Admin. Use the following format:\n\n" +
					    'gtbot export [Database] [Direct Message] (ex: gtbot export main no-dm \ gtbot export castle)' + 
						`${boxtick}`;
					message.channel.send(dispMsg);
					break;
				case 'info':
					var dispMsg = `${boxtick}` + 
						"Get an average stat breakdown for each class as well as total members. Use the following format:\n\n" +
					    'gtbot info' + 
						`${boxtick}`;
					message.channel.send(dispMsg);
					break;
				default:
					sendMainHelpMsg(message);
			}
			break;
		//}
		//{ default
		default:
			sendMainHelpMsg(message);
			break;
		//}
	}	
});

bot.login(auth.token);